import requests
import json
import io
import sys

BASE_URL = 'http://127.0.0.1:8000/api'
results = {'passed': 0, 'failed': 0, 'tests': []}

def record(name, status, details=''):
    results['tests'].append({'name': name, 'status': status, 'details': details})
    if status == 'PASS':
        results['passed'] += 1
        print(f"  [PASS] {name}")
    else:
        results['failed'] += 1
        print(f"  [FAIL] {name}: {details}")

print("=== 1. AUTHENTICATION & SECURITY TESTS ===")

# 1.1 Valid Registration
r = requests.post(f'{BASE_URL}/auth/register', json={
    'full_name': 'Test Student',
    'email': 'qa_test_student_2026@smartstudy.ai',
    'password': 'TestPassword@123'
})
if r.status_code == 200 and 'access_token' in r.json():
    record('Valid User Registration', 'PASS')
    qa_token = r.json()['access_token']
    qa_headers = {'Authorization': f'Bearer {qa_token}'}
elif r.status_code == 400: # Already exists from previous run
    r_log = requests.post(f'{BASE_URL}/auth/login', json={'email': 'qa_test_student_2026@smartstudy.ai', 'password': 'TestPassword@123'})
    qa_token = r_log.json()['access_token']
    qa_headers = {'Authorization': f'Bearer {qa_token}'}
    record('Valid User Registration & Login', 'PASS')
else:
    record('Valid User Registration', 'FAIL', r.text)

# 1.2 Duplicate Email Rejection
r_dup = requests.post(f'{BASE_URL}/auth/register', json={
    'full_name': 'Another User',
    'email': 'qa_test_student_2026@smartstudy.ai',
    'password': 'TestPassword@123'
})
if r_dup.status_code == 400:
    record('Duplicate Email Rejection (400 Bad Request)', 'PASS')
else:
    record('Duplicate Email Rejection', 'FAIL', f'Status {r_dup.status_code}')

# 1.3 Login with Wrong Password
r_wrong = requests.post(f'{BASE_URL}/auth/login', json={
    'email': 'qa_test_student_2026@smartstudy.ai',
    'password': 'WrongPassword999'
})
if r_wrong.status_code == 401:
    record('Wrong Password Rejection (401 Unauthorized)', 'PASS')
else:
    record('Wrong Password Rejection', 'FAIL', f'Status {r_wrong.status_code}')

# 1.4 Login with Unknown Email
r_un = requests.post(f'{BASE_URL}/auth/login', json={
    'email': 'nonexistent_student_xyz@smartstudy.ai',
    'password': 'Password123'
})
if r_un.status_code == 401:
    record('Unknown Email Rejection (401 Unauthorized)', 'PASS')
else:
    record('Unknown Email Rejection', 'FAIL', f'Status {r_un.status_code}')

# 1.5 Valid Demo Login
r_login = requests.post(f'{BASE_URL}/auth/login', json={
    'email': 'student@smartstudy.ai',
    'password': 'password123'
})
if r_login.status_code == 200 and 'access_token' in r_login.json():
    record('Demo Student Login', 'PASS')
    demo_token = r_login.json()['access_token']
    demo_headers = {'Authorization': f'Bearer {demo_token}'}
else:
    record('Demo Student Login', 'FAIL', r_login.text)

# 1.6 Protected Route Rejection Without Token
r_unauth = requests.get(f'{BASE_URL}/auth/me')
if r_unauth.status_code == 401:
    record('Protected Route Rejection Without Auth Header', 'PASS')
else:
    record('Protected Route Rejection', 'FAIL', f'Status {r_unauth.status_code}')

print("\n=== 2. FILE UPLOAD & VALIDATION TESTS ===")

# 2.1 Invalid File Extension Rejection (.exe)
files = {'file': ('malicious.exe', io.BytesIO(b'Binary executable content'), 'application/x-msdownload')}
data = {'subject': 'Computer Networks'}
r_bad_ext = requests.post(f'{BASE_URL}/upload', files=files, data=data, headers=demo_headers)
if r_bad_ext.status_code == 400 and 'Unsupported file format' in r_bad_ext.text:
    record('Invalid File (.exe) Rejection', 'PASS')
else:
    record('Invalid File Rejection', 'FAIL', f'Status {r_bad_ext.status_code}: {r_bad_ext.text}')

# 2.2 Valid PDF Upload & Parsing
pdf_content = b'%PDF-1.4\n1 0 obj\n<< /Title (Database Systems Unit 4) >>\nendobj\n%%EOF\nSample DBMS Chapter content on BCNF and Concurrency.'
files = {'file': ('Test_DBMS_Unit4.pdf', io.BytesIO(pdf_content), 'application/pdf')}
r_pdf = requests.post(f'{BASE_URL}/upload', files=files, data={'subject': 'Database Management Systems'}, headers=demo_headers)
if r_pdf.status_code == 200 and r_pdf.json().get('status') == 'completed':
    uploaded_pdf_id = r_pdf.json()['id']
    record('Valid PDF Upload & Text Extraction', 'PASS')
else:
    record('Valid PDF Upload', 'FAIL', r_pdf.text)

# 2.3 Valid Video File Upload Simulation
video_content = b'RIFF....WAVEfmt ....data....Lecture Audio Video Stream simulation'
files = {'file': ('Lecture_OS_Deadlocks.mp4', io.BytesIO(video_content), 'video/mp4')}
r_vid = requests.post(f'{BASE_URL}/upload', files=files, data={'subject': 'Operating Systems'}, headers=demo_headers)
if r_vid.status_code == 200 and r_vid.json().get('status') == 'completed':
    uploaded_vid_id = r_vid.json()['id']
    record('Valid Video Upload & Speech-to-Text Pipeline', 'PASS')
else:
    record('Valid Video Upload', 'FAIL', r_vid.text)

print("\n=== 3. AI SUMMARY & VIDEO SUMMARIZATION TESTS ===")

# 3.1 Summaries Retrieval
r_sums = requests.get(f'{BASE_URL}/summaries', headers=demo_headers)
if r_sums.status_code == 200 and len(r_sums.json()) > 0:
    record('Retrieve Summaries List', 'PASS')
else:
    record('Retrieve Summaries List', 'FAIL', r_sums.text)

# 3.2 Dynamic Summary Generation
r_gen_sum = requests.post(f'{BASE_URL}/summaries/generate', json={
    'subject': 'Computer Networks',
    'title': 'TCP/IP and Subnetting Architecture',
    'raw_text': 'Computer Networks layered architecture including TCP 3-way handshake and CIDR subnet masking.'
}, headers=demo_headers)
if r_gen_sum.status_code == 200 and 'overview' in r_gen_sum.json():
    record('AI Dynamic Summary Generation', 'PASS')
else:
    record('AI Dynamic Summary Generation', 'FAIL', r_gen_sum.text)

print("\n=== 4. IMPORTANT EXAM POINTS TESTS ===")

# 4.1 Retrieve Categorized Points
r_points = requests.get(f'{BASE_URL}/important-points', headers=demo_headers)
if r_points.status_code == 200 and len(r_points.json()) > 0:
    record('Retrieve Categorized Exam Points', 'PASS')
    pt_id = r_points.json()[0]['id']
else:
    record('Retrieve Categorized Exam Points', 'FAIL', r_points.text)
    pt_id = 1

# 4.2 Toggle Completion Status
r_pt_tog = requests.patch(f'{BASE_URL}/important-points/{pt_id}/toggle', json={'is_completed': True}, headers=demo_headers)
if r_pt_tog.status_code == 200 and r_pt_tog.json().get('is_completed') is True:
    record('Toggle Point Completion Status', 'PASS')
else:
    record('Toggle Point Completion Status', 'FAIL', r_pt_tog.text)

# 4.3 Toggle Revision Queue
r_pt_rev = requests.patch(f'{BASE_URL}/important-points/{pt_id}/toggle', json={'in_revision_queue': True}, headers=demo_headers)
if r_pt_rev.status_code == 200 and r_pt_rev.json().get('in_revision_queue') is True:
    record('Toggle Point Revision Queue', 'PASS')
else:
    record('Toggle Point Revision Queue', 'FAIL', r_pt_rev.text)

print("\n=== 5. AI QUIZ GENERATOR & TEST EVALUATION ===")

# 5.1 Generate MCQ / Mixed Quiz
r_quiz_gen = requests.post(f'{BASE_URL}/quiz/generate', json={
    'subject': 'Database Management Systems',
    'topic': 'BCNF & ACID',
    'difficulty': 'Medium',
    'quiz_type': 'Mixed',
    'num_questions': 5
}, headers=demo_headers)
if r_quiz_gen.status_code == 200 and len(r_quiz_gen.json().get('questions', [])) == 5:
    quiz_id = r_quiz_gen.json()['id']
    record('Generate 5-Question Mixed AI Quiz', 'PASS')
else:
    record('Generate 5-Question Mixed AI Quiz', 'FAIL', r_quiz_gen.text)
    quiz_id = 1

# 5.2 Submit Answers and Receive Instant Grading & Explanations
r_quiz_sub = requests.post(f'{BASE_URL}/quiz/submit', json={
    'quiz_id': quiz_id,
    'answers': {
        '1': 'Boyce-Codd Normal Form (BCNF)',
        '2': 'True',
        '3': 'Isolation',
        '4': 'All actual data records/pointers reside only in leaf nodes, making range queries highly efficient via linked leaves',
        '5': 'An attribute or set of attributes in a table that references the primary key of another table to maintain referential integrity'
    },
    'time_spent_seconds': 110
}, headers=demo_headers)
if r_quiz_sub.status_code == 200 and r_quiz_sub.json().get('score') >= 4:
    res = r_quiz_sub.json()
    record(f'Quiz Submission & Instant Grading (Score: {res["score"]}/{res["total_questions"]})', 'PASS')
else:
    record('Quiz Submission & Instant Grading', 'FAIL', r_quiz_sub.text)

print("\n=== 6. STUDY PLANNER & TIMETABLE TESTS ===")

# 6.1 Generate Spaced Repetition Study Schedule
r_plan_gen = requests.post(f'{BASE_URL}/study-plan/generate', json={
    'title': 'Semester Exam Strategy Plan',
    'daily_available_hours': 4.0,
    'preferred_study_time': 'Evening (4 PM - 8 PM)',
    'subjects': [
        {'subject_name': 'Database Management Systems', 'exam_date': '2026-08-25', 'difficulty': 'Hard'},
        {'subject_name': 'Operating Systems', 'exam_date': '2026-08-28', 'difficulty': 'Medium'},
        {'subject_name': 'Computer Networks', 'exam_date': '2026-08-30', 'difficulty': 'Medium'}
    ]
}, headers=demo_headers)
if r_plan_gen.status_code == 200 and len(r_plan_gen.json().get('schedule', [])) > 0:
    plan = r_plan_gen.json()
    record(f'Study Plan Generation ({plan["total_days"]} days schedule)', 'PASS')
    slot_id = plan['schedule'][0]['slots'][0]['id']
else:
    record('Study Plan Generation', 'FAIL', r_plan_gen.text)
    slot_id = 't1'

# 6.2 Toggle Schedule Task Completion
r_slot_tog = requests.post(f'{BASE_URL}/study-plan/task/toggle', json={'task_id': slot_id, 'is_completed': True}, headers=demo_headers)
if r_slot_tog.status_code == 200:
    record('Toggle Study Schedule Task Completion', 'PASS')
else:
    record('Toggle Study Schedule Task Completion', 'FAIL', r_slot_tog.text)

print("\n=== 7. PDF Q&A & AI CHAT ASSISTANT TESTS ===")

# 7.1 Grounded PDF Q&A
r_pdf_ask = requests.post(f'{BASE_URL}/pdf/ask', json={'question': 'What are ACID properties in database systems?'}, headers=demo_headers)
if r_pdf_ask.status_code == 200 and 'answer' in r_pdf_ask.json() and len(r_pdf_ask.json().get('page_references', [])) > 0:
    record(f'Chat with PDF with Page Citations {r_pdf_ask.json()["page_references"]}', 'PASS')
else:
    record('Chat with PDF with Page Citations', 'FAIL', r_pdf_ask.text)

# 7.2 AI Study Assistant Conversational Tutor
r_chat = requests.post(f'{BASE_URL}/chat/message', json={'message': 'Explain Process Scheduling and SJF algorithm simply for exams.'}, headers=demo_headers)
if r_chat.status_code == 200 and 'reply' in r_chat.json():
    record('AI Study Assistant Chat Response', 'PASS')
else:
    record('AI Study Assistant Chat Response', 'FAIL', r_chat.text)

# 7.3 Clear Chat History
r_clear = requests.delete(f'{BASE_URL}/chat/clear', headers=demo_headers)
if r_clear.status_code == 200:
    record('Clear Conversation History', 'PASS')
else:
    record('Clear Conversation History', 'FAIL', r_clear.text)

print("\n=== 8. PROGRESS & DASHBOARD METRICS TESTS ===")

# 8.1 Dashboard Aggregation
r_dash = requests.get(f'{BASE_URL}/dashboard', headers=demo_headers)
if r_dash.status_code == 200 and 'statistics' in r_dash.json():
    record('Dashboard Metrics Aggregation', 'PASS')
else:
    record('Dashboard Metrics Aggregation', 'FAIL', r_dash.text)

# 8.2 Progress Analytics
r_prog = requests.get(f'{BASE_URL}/progress', headers=demo_headers)
if r_prog.status_code == 200 and len(r_prog.json().get('weekly_hours_chart', [])) == 7:
    record('Progress Analytics & Weekly Hours Chart Data', 'PASS')
else:
    record('Progress Analytics Data', 'FAIL', r_prog.text)

# 8.3 Profile & Settings Update
r_set = requests.put(f'{BASE_URL}/auth/update', json={'daily_study_hours': 4.5, 'preferred_study_time': 'Evening (4 PM - 8 PM)'}, headers=demo_headers)
if r_set.status_code == 200 and r_set.json().get('daily_study_hours') == 4.5:
    record('Save User Study Preferences in Settings', 'PASS')
else:
    record('Save User Study Preferences', 'FAIL', r_set.text)

print("\n=== 9. MATERIALS LIBRARY & CLEANUP TESTS ===")

# 9.1 Materials Library Search & Filter
r_mats = requests.get(f'{BASE_URL}/materials?file_type=pdf', headers=demo_headers)
if r_mats.status_code == 200:
    record('Search & Filter Materials Library', 'PASS')
else:
    record('Search & Filter Materials Library', 'FAIL', r_mats.text)

# 9.2 Delete Material
r_del = requests.delete(f'{BASE_URL}/materials/{uploaded_pdf_id}', headers=demo_headers)
if r_del.status_code == 200:
    record('Delete Material Record & Storage Clean-Up', 'PASS')
else:
    record('Delete Material', 'FAIL', r_del.text)

print(f"\n================================================")
print(f"TOTAL TESTS: {len(results['tests'])} | PASSED: {results['passed']} | FAILED: {results['failed']}")
print(f"================================================")

if results['failed'] > 0:
    sys.exit(1)
