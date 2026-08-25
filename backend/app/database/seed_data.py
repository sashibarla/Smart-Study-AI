import json
import datetime
from sqlalchemy.orm import Session
from app.models.models import User, UploadedFile, Summary, ImportantPoint, Quiz, QuizResult, Exam, StudySchedule, StudyProgress, ChatHistory
from app.core.security import get_password_hash
from app.services.scheduler import scheduler
from app.services.ai_service import CSE_KNOWLEDGE_BANK

def seed_database(db: Session):
    """Seed initial realistic demo data if user doesn't already exist."""
    existing_user = db.query(User).filter(User.email == "student@smartstudy.ai").first()
    if existing_user:
        return  # Already seeded

    print("[Database Seed] Seeding demo student and educational materials...")
    
    # 1. Create Default Student User
    demo_user = User(
        full_name="Alex Chen",
        email="student@smartstudy.ai",
        hashed_password=get_password_hash("password123"),
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        daily_study_hours=4.5,
        preferred_study_time="Evening (4 PM - 8 PM)",
        difficulty_preference="Medium",
        theme_preference="light",
        notifications_enabled=True
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)

    # 2. Create Study Progress
    progress = StudyProgress(
        user_id=demo_user.id,
        total_study_minutes=1710, # 28.5 hours
        study_streak_days=7,
        last_study_date=datetime.date.today().strftime("%Y-%m-%d"),
        topics_completed_count=42
    )
    db.add(progress)

    # 3. Create Uploaded Materials
    materials = [
        UploadedFile(
            user_id=demo_user.id,
            original_name="DBMS_Unit_3_Normalization_and_Transactions.pdf",
            stored_name="demo_dbms_unit3.pdf",
            file_path="uploads/demo_dbms_unit3.pdf",
            file_type="pdf",
            file_size=2450000,
            num_pages=18,
            subject="Database Management Systems",
            status="completed",
            extracted_text="Database Management Systems: Relational Normalization (1NF, 2NF, 3NF, BCNF) and Transaction ACID properties with Concurrency Control protocols."
        ),
        UploadedFile(
            user_id=demo_user.id,
            original_name="Operating_Systems_Lecture_07_CPU_Scheduling.mp4",
            stored_name="demo_os_lecture7.mp4",
            file_path="uploads/demo_os_lecture7.mp4",
            file_type="video",
            file_size=18500000,
            duration_seconds=1840.0,
            subject="Operating Systems",
            status="completed",
            extracted_text="Operating Systems Lecture on CPU scheduling algorithms: FCFS, Shortest Job First, Round Robin, Multilevel Queue, and Preemption mechanisms."
        ),
        UploadedFile(
            user_id=demo_user.id,
            original_name="Computer_Networks_TCP_IP_Protocol_Stack.pdf",
            stored_name="demo_cn_tcpip.pdf",
            file_path="uploads/demo_cn_tcpip.pdf",
            file_type="pdf",
            file_size=3120000,
            num_pages=24,
            subject="Computer Networks",
            status="completed",
            extracted_text="Computer Networks: OSI 7-Layer and TCP/IP Architecture, Subnetting CIDR calculation, Dijkstra Link-State routing, and TCP 3-way handshake."
        ),
        UploadedFile(
            user_id=demo_user.id,
            original_name="Machine_Learning_Supervised_Algorithms.pdf",
            stored_name="demo_ml_algorithms.pdf",
            file_path="uploads/demo_ml_algorithms.pdf",
            file_type="pdf",
            file_size=1980000,
            num_pages=15,
            subject="Artificial Intelligence",
            status="completed",
            extracted_text="Supervised learning: Linear/Logistic Regression, Decision Trees, SVM, Backpropagation in Neural Networks, and F1-Score evaluation."
        )
    ]
    for m in materials:
        db.add(m)
    db.commit()
    for m in materials:
        db.refresh(m)

    # 4. Create Summaries
    for m, key in zip(materials, ["dbms", "os", "cn", "aiml"]):
        kb = CSE_KNOWLEDGE_BANK[key]
        summary = Summary(
            user_id=demo_user.id,
            file_id=m.id,
            title=f"{kb['title']} - Complete Study Notes",
            subject=m.subject,
            overview=kb["summary"],
            main_concepts=json.dumps([f"{c['topic']}: {c['detail']}" for c in kb["concepts"]]),
            definitions=json.dumps(kb["definitions"]),
            explanations=json.dumps([f"Deep Dive on {c['topic']}: {c['detail']}" for c in kb["concepts"][:3]]),
            formulas=json.dumps(kb["formulas"]),
            key_takeaways=json.dumps([
                f"Master core foundations of {kb['title']}.",
                "Key priority for university examinations.",
                "Review mathematical derivations and step-by-step algorithms.",
                "Practice relevant quiz questions in the practice tab."
            ]),
            raw_markdown=f"# {kb['title']}\n\n{kb['summary']}\n\n## Key Concepts\n" + "\n".join([f"- **{c['topic']}**: {c['detail']}" for c in kb["concepts"]]),
            estimated_reading_time_mins=6,
            source_type=m.file_type
        )
        db.add(summary)

    # 5. Create Important Exam Points
    for m, key in zip(materials, ["dbms", "os", "cn", "aiml"]):
        kb = CSE_KNOWLEDGE_BANK[key]
        for c in kb["concepts"][:2]:
            db.add(ImportantPoint(
                user_id=demo_user.id,
                file_id=m.id,
                subject=m.subject,
                category="priority_topic",
                priority="High",
                topic=c["topic"],
                explanation=c["detail"],
                is_completed=False,
                in_revision_queue=True
            ))
        for d in kb["definitions"][:2]:
            db.add(ImportantPoint(
                user_id=demo_user.id,
                file_id=m.id,
                subject=m.subject,
                category="definition",
                priority="High",
                topic=d["term"],
                explanation=d["definition"],
                is_completed=True,
                in_revision_queue=False
            ))
        for f in kb["formulas"][:2]:
            db.add(ImportantPoint(
                user_id=demo_user.id,
                file_id=m.id,
                subject=m.subject,
                category="formula",
                priority="High",
                topic=f["name"],
                explanation=f"Key formula for exam calculations in {m.subject}.",
                formula_or_syntax=f["syntax"],
                is_completed=False,
                in_revision_queue=True
            ))
        for q in kb["questions"][:2]:
            db.add(ImportantPoint(
                user_id=demo_user.id,
                file_id=m.id,
                subject=m.subject,
                category="expected_question",
                priority="High",
                topic="Expected Semester Question",
                explanation=q,
                is_completed=False,
                in_revision_queue=True
            ))

    # 6. Create Demo Quizzes
    quiz_dbms = Quiz(
        user_id=demo_user.id,
        file_id=materials[0].id,
        title="DBMS Normalization & Concurrency Mastery Test",
        subject="Database Management Systems",
        topic="Normalization & Transactions",
        difficulty="Medium",
        quiz_type="Mixed",
        num_questions=5,
        questions_json=json.dumps([
            {
                "id": 1,
                "type": "mcq",
                "question": "Which normal form requires every determinant to be a candidate/super key with no non-trivial functional dependencies?",
                "options": ["1NF", "2NF", "3NF", "Boyce-Codd Normal Form (BCNF)"],
                "correct_answer": "Boyce-Codd Normal Form (BCNF)",
                "explanation": "BCNF is a stricter version of 3NF where for every functional dependency X -> Y, X must strictly be a super key.",
                "topic": "Normalization",
                "difficulty": "Medium"
            },
            {
                "id": 2,
                "type": "true_false",
                "question": "Strict Two-Phase Locking (Strict 2PL) guarantees that all exclusive (write) locks are held until the transaction commits or aborts.",
                "options": ["True", "False"],
                "correct_answer": "True",
                "explanation": "Strict 2PL prevents cascading rollbacks and guarantees serializability by holding exclusive locks until the end of the transaction.",
                "topic": "Concurrency Control",
                "difficulty": "Hard"
            },
            {
                "id": 3,
                "type": "fill_blank",
                "question": "The 'I' in the ACID transaction properties stands for __________.",
                "options": ["Isolation", "Integrity", "Indexing", "Iteration"],
                "correct_answer": "Isolation",
                "explanation": "ACID stands for Atomicity, Consistency, Isolation, and Durability.",
                "topic": "Transactions",
                "difficulty": "Easy"
            },
            {
                "id": 4,
                "type": "mcq",
                "question": "What is the primary advantage of a B+ Tree over a standard B Tree for relational databases?",
                "options": [
                    "All actual data records/pointers reside only in leaf nodes, making range queries highly efficient via linked leaves",
                    "B+ trees require no balancing operations upon insertion",
                    "B+ trees do not need disk storage",
                    "B+ trees have a constant O(1) worst-case search time"
                ],
                "correct_answer": "All actual data records/pointers reside only in leaf nodes, making range queries highly efficient via linked leaves",
                "explanation": "In B+ Trees, internal nodes only store keys for routing, and all leaf nodes are connected via a doubly linked list, optimizing sequential scans.",
                "topic": "Indexing",
                "difficulty": "Medium"
            },
            {
                "id": 5,
                "type": "short_answer",
                "question": "What is a Foreign Key in relational database modeling?",
                "options": [
                    "An attribute or set of attributes in a table that references the primary key of another table to maintain referential integrity",
                    "A key used exclusively for encryption",
                    "The first column in every database table",
                    "A candidate key that was rejected by the DBA"
                ],
                "correct_answer": "An attribute or set of attributes in a table that references the primary key of another table to maintain referential integrity",
                "explanation": "Foreign keys enforce referential integrity by ensuring relationships between records in different tables remain consistent.",
                "topic": "Relational Model",
                "difficulty": "Easy"
            }
        ])
    )
    db.add(quiz_dbms)
    db.commit()
    db.refresh(quiz_dbms)

    # 7. Create Demo Quiz Result
    quiz_res = QuizResult(
        user_id=demo_user.id,
        quiz_id=quiz_dbms.id,
        score=4,
        total_questions=5,
        percentage=80.0,
        time_spent_seconds=145,
        answers_json=json.dumps({
            "1": "Boyce-Codd Normal Form (BCNF)",
            "2": "True",
            "3": "Isolation",
            "4": "All actual data records/pointers reside only in leaf nodes, making range queries highly efficient via linked leaves",
            "5": "The first column in every database table"
        }),
        ai_feedback="Great performance! You demonstrated solid understanding of BCNF, 2PL, ACID, and B+ Trees. Review foreign key constraints and referential integrity rules.",
        topic_performance_json=json.dumps({
            "Normalization": 100,
            "Concurrency Control": 100,
            "Transactions": 100,
            "Indexing": 100,
            "Relational Model": 0
        })
    )
    db.add(quiz_res)

    # 8. Create Upcoming Exams
    exams = [
        Exam(
            user_id=demo_user.id,
            subject_name="Database Management Systems",
            exam_date=(datetime.date.today() + datetime.timedelta(days=8)).strftime("%Y-%m-%d"),
            target_score=95,
            priority="High",
            progress_percentage=75
        ),
        Exam(
            user_id=demo_user.id,
            subject_name="Operating Systems",
            exam_date=(datetime.date.today() + datetime.timedelta(days=11)).strftime("%Y-%m-%d"),
            target_score=90,
            priority="High",
            progress_percentage=60
        ),
        Exam(
            user_id=demo_user.id,
            subject_name="Computer Networks",
            exam_date=(datetime.date.today() + datetime.timedelta(days=15)).strftime("%Y-%m-%d"),
            target_score=88,
            priority="Medium",
            progress_percentage=45
        ),
        Exam(
            user_id=demo_user.id,
            subject_name="Artificial Intelligence & ML",
            exam_date=(datetime.date.today() + datetime.timedelta(days=20)).strftime("%Y-%m-%d"),
            target_score=92,
            priority="Medium",
            progress_percentage=35
        )
    ]
    for e in exams:
        db.add(e)

    # 9. Create Study Schedule
    subjects_input = [
        {"subject_name": "Database Management Systems", "exam_date": (datetime.date.today() + datetime.timedelta(days=8)).strftime("%Y-%m-%d"), "difficulty": "Hard"},
        {"subject_name": "Operating Systems", "exam_date": (datetime.date.today() + datetime.timedelta(days=11)).strftime("%Y-%m-%d"), "difficulty": "Medium"},
        {"subject_name": "Computer Networks", "exam_date": (datetime.date.today() + datetime.timedelta(days=15)).strftime("%Y-%m-%d"), "difficulty": "Medium"}
    ]
    plan_data = scheduler.generate_plan(subjects_input, daily_hours=4.0, preferred_time="Morning (8 AM - 12 PM)")
    study_sched = StudySchedule(
        user_id=demo_user.id,
        title="Semester Final Examinations Prep Timetable",
        start_date=plan_data["start_date"],
        end_date=plan_data["end_date"],
        total_days=plan_data["total_days"],
        daily_hours=plan_data["daily_hours"],
        schedule_json=json.dumps(plan_data["schedule"])
    )
    db.add(study_sched)

    # 10. Create Initial AI Chat History
    chats = [
        ChatHistory(user_id=demo_user.id, role="user", content="Can you summarize Unit 3 of DBMS and give me expected exam questions?"),
        ChatHistory(user_id=demo_user.id, role="assistant", content="### DBMS Unit 3: Normalization & Transactions Summary\n\n- **Normalization:** Decomposing relations from 1NF to BCNF eliminates update, insertion, and deletion anomalies.\n- **ACID:** Atomicity, Consistency, Isolation, Durability ensure fault tolerance.\n- **Concurrency:** Strict 2-Phase Locking guarantees serializability without cascading aborts.\n\n🔥 **Top Exam Questions:**\n1. Explain BCNF decomposition with an example.\n2. Compare Strict 2PL vs Rigorous 2PL.\n3. How does WAL (Write-Ahead Logging) ensure durability?")
    ]
    for c in chats:
        db.add(c)

    db.commit()
    print("[Database Seed] Seed data generated successfully.")
