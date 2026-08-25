import datetime
from typing import List, Dict, Any

class StudyScheduler:
    @staticmethod
    def generate_plan(subjects_data: List[Dict[str, Any]], daily_hours: float = 4.0, preferred_time: str = "Evening") -> Dict[str, Any]:
        """
        Generate a multi-day study schedule with spaced repetition, concept study,
        revision checkpoints, and practice quiz blocks based on exam dates.
        """
        today = datetime.date.today()
        
        # Parse subjects and calculate days to exam
        processed_subjects = []
        max_target_date = today + datetime.timedelta(days=14)

        for s in subjects_data:
            name = s.get("subject_name", "Subject")
            date_str = s.get("exam_date", "")
            try:
                exam_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
            except Exception:
                # Default to today + 10 days
                exam_date = today + datetime.timedelta(days=10)
                
            days_left = max(1, (exam_date - today).days)
            if exam_date > max_target_date:
                max_target_date = exam_date
                
            diff = s.get("difficulty", "Medium")
            weight = 1.5 if diff == "Hard" else (1.0 if diff == "Medium" else 0.8)

            # Topic pools for standard CSE subjects
            topic_map = {
                "dbms": ["ER Modeling & Relational Schema", "Functional Dependencies & Normalization (1NF to BCNF)", "Transaction ACID Properties & Recovery", "Two-Phase Locking & Concurrency Control", "Indexing, B+ Trees & Query Optimization"],
                "operating systems": ["Process States, Scheduling & Context Switching", "Process Synchronization, Semaphores & Critical Section", "Deadlock Conditions & Banker's Algorithm", "Virtual Memory, Paging & Page Replacement", "File System Implementation & Disk Scheduling"],
                "computer networks": ["OSI vs TCP/IP Reference Models", "Data Link Layer, Framing & CRC Error Control", "IPv4 Addressing, Subnetting & CIDR", "Dijkstra Routing Protocols & OSPF", "TCP 3-Way Handshake & Congestion Control (AIMD)"],
                "artificial intelligence": ["State Space Search & A* Heuristic Algorithm", "Adversarial Search & Minimax Alpha-Beta", "Supervised Learning, Regression & Decision Trees", "Neural Networks & Backpropagation Gradient Descent", "Transformer Architectures & Self-Attention"],
                "machine learning": ["Linear & Logistic Regression with Regularization", "Support Vector Machines & Kernel Trick", "Random Forests, Bagging & Boosting (XGBoost)", "K-Means Clustering & Dimensionality Reduction (PCA)", "Model Evaluation Metrics: ROC-AUC, F1-Score"]
            }

            matched_topics = ["Fundamental Principles", "Architecture & Mechanisms", "Mathematical Formulations", "Advanced Problem Solving", "Comprehensive Revision"]
            for k, v in topic_map.items():
                if k in name.lower():
                    matched_topics = v
                    break

            processed_subjects.append({
                "name": name,
                "exam_date": exam_date,
                "days_left": days_left,
                "difficulty": diff,
                "weight": weight,
                "topics": matched_topics
            })

        total_days = min(30, max(7, (max_target_date - today).days))
        
        # Time windows
        if "Morning" in preferred_time:
            time_slots = [("08:00 AM", "09:30 AM"), ("10:00 AM", "11:30 AM"), ("02:00 PM", "03:00 PM"), ("05:00 PM", "06:00 PM")]
        elif "Afternoon" in preferred_time:
            time_slots = [("01:00 PM", "02:30 PM"), ("03:00 PM", "04:30 PM"), ("06:00 PM", "07:00 PM"), ("08:00 PM", "09:00 PM")]
        else: # Evening
            time_slots = [("04:00 PM", "05:30 PM"), ("06:00 PM", "07:30 PM"), ("08:30 PM", "09:30 PM"), ("10:00 PM", "11:00 PM")]

        schedule_days = []

        for day_idx in range(total_days):
            current_date = today + datetime.timedelta(days=day_idx)
            day_name = current_date.strftime("%A")
            date_str = current_date.strftime("%Y-%m-%d")
            
            day_slots = []
            # Rotate subjects across slots
            for slot_idx, (start_t, end_t) in enumerate(time_slots[:3]):
                sub = processed_subjects[(day_idx + slot_idx) % len(processed_subjects)]
                topic_idx = (day_idx + slot_idx) % len(sub["topics"])
                topic = sub["topics"][topic_idx]

                if slot_idx == 0:
                    task_type = "Concept Study"
                elif slot_idx == 1:
                    task_type = "Practice Quiz & Problems"
                else:
                    task_type = "Revision & Formula Memorization"

                slot_id = f"task_{day_idx}_{slot_idx}"
                day_slots.append({
                    "id": slot_id,
                    "day": day_name,
                    "date": date_str,
                    "start_time": start_t,
                    "end_time": end_t,
                    "subject": sub["name"],
                    "topic": topic,
                    "task_type": task_type,
                    "is_completed": day_idx == 0 and slot_idx == 0  # First task completed as demo
                })

            schedule_days.append({
                "day_number": day_idx + 1,
                "day_name": day_name,
                "date": date_str,
                "is_today": day_idx == 0,
                "slots": day_slots
            })

        return {
            "start_date": today.strftime("%Y-%m-%d"),
            "end_date": (today + datetime.timedelta(days=total_days - 1)).strftime("%Y-%m-%d"),
            "total_days": total_days,
            "daily_hours": daily_hours,
            "schedule": schedule_days
        }

scheduler = StudyScheduler()
