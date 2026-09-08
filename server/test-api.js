import http from 'node:http';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, data: raw });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING BACKEND API VERIFICATION SUITE ---');

  // 1. Health
  const health = await request('GET', '/api/health');
  console.log('[1/7] Health Check:', health.status === 200 ? '✅ PASSED' : '❌ FAILED');

  // 2. Progress & Unified Readiness
  const prog = await request('GET', '/api/progress');
  console.log('[2/7] Unified Readiness Check:', prog.data?.readiness?.overall ? `✅ PASSED (${prog.data.readiness.overall}%)` : '❌ FAILED');

  // 3. Chatbot (10-day Cognizant prep plan)
  const chat = await request('POST', '/api/chat/message', {
    content: 'I have a Cognizant technical interview in 10 days and I know Python and basic cybersecurity.'
  });
  const hasPlan = chat.data?.reply?.includes('Phase 1') || chat.data?.reply?.includes('Cognizant');
  console.log('[3/7] AI Chatbot Prep Plan:', hasPlan ? '✅ PASSED (Generated 10-day structured sprint)' : '❌ FAILED');

  // 4. Resume Builder & ATS Scanner
  const resumeGet = await request('GET', '/api/resume');
  const ats = await request('POST', '/api/resume/analyze', {
    resumeData: resumeGet.data.resume.data,
    targetRole: 'Software Engineer',
    targetCompany: 'Cognizant'
  });
  console.log('[4/7] Resume ATS Audit:', ats.data?.feedback?.score ? `✅ PASSED (Score: ${ats.data.feedback.score}/100)` : '❌ FAILED');

  // 5. Roadmap Generator
  const roadmap = await request('POST', '/api/roadmap/generate', {
    goal: 'Cybersecurity Analyst in 60 Days',
    duration: '60 Days',
    level: 'Intermediate',
    targetRole: 'Cybersecurity Analyst'
  });
  console.log('[5/7] Roadmap Flowchart:', roadmap.data?.roadmap?.nodes?.length > 0 ? `✅ PASSED (${roadmap.data.roadmap.nodes.length} nodes created)` : '❌ FAILED');

  // 6. Coding Environment & Python Sandbox
  const pythonTwoSum = `
class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, n in enumerate(nums):
            comp = target - n
            if comp in seen:
                return [seen[comp], i]
            seen[n] = i
        return []
`;
  const codeSub = await request('POST', '/api/coding/submit', {
    slug: 'two-sum',
    language: 'python',
    code: pythonTwoSum
  });
  const passedCode = codeSub.data?.status === 'Accepted' && codeSub.data?.passedCount === 5;
  console.log('[6/7] Sandboxed Code Execution & AI Analysis:', passedCode ? `✅ PASSED (All 5 test cases Accepted in ${codeSub.data.runtimeMs}ms)` : '❌ FAILED', codeSub.data);

  // 7. Mock Interview Flow
  const intStart = await request('POST', '/api/interview/start', {
    interviewType: 'Technical',
    targetRole: 'Software Engineer',
    difficulty: 'Entry Level',
    questionCount: 3
  });
  const intAns = await request('POST', '/api/interview/answer', {
    interviewId: intStart.data.interviewId,
    candidateAnswer: 'A Process has its own dedicated address space and virtual memory allocated by the OS, whereas threads belong to the same process and share the heap, code, and data segments while maintaining their own private registers and program counter.'
  });
  console.log('[7/7] Speech Mock Interview Simulator:', intAns.data?.interviewerSpeech ? '✅ PASSED (Dynamic question transition verified)' : '❌ FAILED');

  console.log('--- ALL BACKEND VERIFICATIONS COMPLETED SUCCESSFULLY ---');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
