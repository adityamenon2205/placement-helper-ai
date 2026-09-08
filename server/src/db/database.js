import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'placement_helper.db');
export const db = new DatabaseSync(dbPath);

// Initialize Tables
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      target_role TEXT DEFAULT 'Software Engineer',
      target_company TEXT DEFAULT 'Cognizant / Top Tech',
      prep_timeline TEXT DEFAULT '10 Days',
      current_level TEXT DEFAULT 'Intermediate',
      college TEXT DEFAULT 'National Institute of Technology',
      branch TEXT DEFAULT 'Computer Science & Engineering',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resumes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      template TEXT DEFAULT 'modern',
      data_json TEXT NOT NULL,
      ats_score INTEGER DEFAULT 0,
      ats_feedback_json TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS roadmaps (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      goal TEXT NOT NULL,
      duration TEXT NOT NULL,
      level TEXT NOT NULL,
      target_role TEXT NOT NULL,
      target_company TEXT,
      nodes_json TEXT NOT NULL,
      progress_pct INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      action_type TEXT,
      action_payload_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coding_problems (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      category TEXT NOT NULL,
      companies_json TEXT,
      description TEXT NOT NULL,
      constraints TEXT,
      examples_json TEXT NOT NULL,
      test_cases_json TEXT NOT NULL,
      starter_code_json TEXT NOT NULL,
      optimal_solution_json TEXT,
      hints_json TEXT
    );

    CREATE TABLE IF NOT EXISTS coding_submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      problem_id TEXT NOT NULL,
      language TEXT NOT NULL,
      code TEXT NOT NULL,
      status TEXT NOT NULL,
      passed_count INTEGER DEFAULT 0,
      total_count INTEGER DEFAULT 0,
      runtime_ms INTEGER DEFAULT 0,
      ai_analysis_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS mock_interviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      interview_type TEXT NOT NULL,
      target_role TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      question_count INTEGER DEFAULT 5,
      overall_score INTEGER DEFAULT 0,
      report_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      module TEXT NOT NULL,
      action TEXT NOT NULL,
      description TEXT NOT NULL,
      score INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  // Check if default user exists
  const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get('default-user');
  if (!existingUser) {
    db.prepare(`
      INSERT INTO users (id, name, email, target_role, target_company, prep_timeline, current_level, college, branch)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'default-user',
      'Aditya Menon',
      'aditya.menon@example.com',
      'Software Development Engineer',
      'Cognizant / Tier-1 Tech',
      '10 Days',
      'Intermediate (Python + Core CS)',
      'National Institute of Technology',
      'Computer Science & Engineering'
    );
  }

  // Check if default resume exists
  const existingResume = db.prepare('SELECT id FROM resumes WHERE user_id = ?').get('default-user');
  if (!existingResume) {
    const defaultResumeData = {
      personalInfo: {
        fullName: 'Aditya Menon',
        email: 'aditya.menon@example.com',
        phone: '+91 98765 43210',
        location: 'Bengaluru, India',
        portfolio: 'https://adityamenon.dev',
        linkedin: 'https://linkedin.com/in/adityamenon',
        github: 'https://github.com/adityamenon'
      },
      summary: 'Proactive Computer Science student targeting Software Development and Cybersecurity roles. Proficient in Python, C++, Data Structures & Algorithms, and full-stack development with hands-on experience building secure web applications and real-time AI tools.',
      education: [
        {
          degree: 'B.Tech in Computer Science and Engineering',
          institution: 'National Institute of Technology',
          location: 'India',
          startDate: '2022',
          endDate: '2026',
          cgpa: '8.85 / 10.0',
          coursework: 'Data Structures, Algorithms, Operating Systems, Database Management Systems, Computer Networks, Cyber Security, Cloud Computing'
        }
      ],
      skills: {
        languages: ['Python', 'C++', 'Java', 'JavaScript', 'SQL', 'Bash'],
        frameworks: ['React', 'Node.js', 'Express', 'FastAPI', 'Tailwind CSS'],
        tools: ['Git', 'Docker', 'Linux', 'Postman', 'VS Code', 'AWS (EC2, S3)'],
        databases: ['PostgreSQL', 'SQLite', 'MongoDB', 'Redis'],
        coreCS: ['DSA', 'OOP', 'OS Concepts', 'DBMS & SQL', 'Computer Networks', 'System Design']
      },
      experience: [
        {
          role: 'Software Development Engineering Intern',
          company: 'ISOC Technology Labs',
          location: 'Bengaluru, India',
          startDate: 'Jun 2025',
          endDate: 'Aug 2025',
          highlights: [
            'Engineered high-throughput REST APIs handling 45,000+ daily requests using Node.js and PostgreSQL with sub-120ms latency.',
            'Implemented JWT-based authentication and role-based access control (RBAC), eliminating vulnerability vectors.',
            'Collaborated in an Agile team of 6 engineers, participating in code reviews, CI/CD pipeline automation, and unit testing.'
          ]
        }
      ],
      projects: [
        {
          title: 'Predictive Maintenance IoT Platform',
          techStack: ['Python', 'FastAPI', 'Machine Learning', 'React', 'Docker'],
          liveUrl: 'https://demo-predictive.app',
          githubUrl: 'https://github.com/adityamenon/predictive-maintenance',
          bullets: [
            'Built real-time telemetry anomaly detection pipeline using Python and Scikit-Learn with 94.2% predictive accuracy.',
            'Constructed interactive telemetry dashboard in React, reducing diagnostic latency by 40% for field operators.',
            'Containerized services using Docker and orchestrated automated CI deployment with GitHub Actions.'
          ]
        },
        {
          title: 'Secure File Vault & Zero-Knowledge Storage',
          techStack: ['C++', 'Cryptography', 'OpenSSL', 'SQLite'],
          liveUrl: '',
          githubUrl: 'https://github.com/adityamenon/secure-vault',
          bullets: [
            'Implemented AES-256-GCM authenticated encryption and SHA-256 hashing in C++ for tamper-evident file archiving.',
            'Optimized file chunking and multithreaded stream compression, achieving 3.2x faster indexing for large files.'
          ]
        }
      ],
      certifications: [
        'AWS Certified Cloud Practitioner (2025)',
        'Meta Front-End Developer Professional Certificate (Coursera)',
        'HackerRank Problem Solving (5 Stars - Gold Badge)'
      ],
      achievements: [
        'Solved 450+ algorithmic challenges on LeetCode / HackerRank across Arrays, Trees, Graphs, and DP.',
        'Top 10 Finalist at National Smart India Hackathon among 1,200+ participating teams.',
        'Technical Head of College Coding & Open-Source Club, mentoring 150+ juniors in DSA and Web Development.'
      ],
      customization: {
        template: 'modern',
        font: 'Inter',
        fontSize: 'medium',
        spacing: 'normal',
        margins: 'normal',
        accentColor: '#2563eb'
      }
    };

    db.prepare(`
      INSERT INTO resumes (id, user_id, title, template, data_json, ats_score, ats_feedback_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'default-resume',
      'default-user',
      'Aditya Menon - SDE Resume (2026)',
      'modern',
      JSON.stringify(defaultResumeData),
      88,
      JSON.stringify({
        score: 88,
        grade: 'A',
        summary: 'Strong technical resume with quantified impact metrics, clear ATS keyword coverage, and robust technical project details.',
        strengths: [
          'Quantified results included in work experience and projects (e.g. 45k+ requests, 94.2% accuracy).',
          'Standard chronological format with clean, searchable section headers.',
          'Strong CS fundamentals evident across languages, databases, and core coursework.'
        ],
        suggestions: [
          'Add 1-2 cloud infrastructure metrics (e.g., AWS S3 bucket throughput or cost optimization).',
          'Include a target job title headline at the top for specific corporate ATS match filters.'
        ],
        keywordMatch: {
          present: ['Python', 'C++', 'Node.js', 'PostgreSQL', 'Docker', 'REST API', 'Algorithms', 'CI/CD'],
          missing: ['Microservices', 'Kubernetes', 'Redis Caching']
        }
      })
    );
  }

  // Seed default roadmap
  const existingRoadmap = db.prepare('SELECT id FROM roadmaps WHERE user_id = ?').get('default-user');
  if (!existingRoadmap) {
    const defaultRoadmapNodes = [
      {
        id: 'node-1',
        title: 'Core Programming & Complexity Analysis',
        stage: 'Fundamentals',
        duration: 'Days 1-2',
        status: 'completed',
        topics: ['Time & Space Complexity Big-O', 'Python & C++ STL Fundamentals', 'Pointers & Memory Models'],
        practice: 'Warmup problems: Two Sum, Reverse String, Valid Anagram',
        resources: 'MIT 6.006 Lecture 1, NeetCode Big-O Guide'
      },
      {
        id: 'node-2',
        title: 'Linear Data Structures Mastery',
        stage: 'Data Structures',
        duration: 'Days 3-4',
        status: 'completed',
        topics: ['Dynamic Arrays & Strings', 'Linked Lists (Reversal, Fast & Slow)', 'Stacks & Queues (Monotonic Stack)'],
        practice: 'Reverse Linked List, Valid Parentheses, Daily Temperatures',
        resources: 'Striver SDE Sheet Day 1-3'
      },
      {
        id: 'node-3',
        title: 'Trees, BST & Graph Traversals',
        stage: 'Advanced DSA',
        duration: 'Days 5-6',
        status: 'in_progress',
        topics: ['Binary Tree DFS/BFS', 'Lowest Common Ancestor', 'Graph Traversal (BFS/DFS, Topological Sort, Dijkstra)'],
        practice: 'Binary Tree Level Order, Course Schedule, Number of Islands',
        resources: 'LeetCode Tree & Graph Exploration Card'
      },
      {
        id: 'node-4',
        title: 'Dynamic Programming & Greedy Approaches',
        stage: 'Algorithms',
        duration: 'Day 7',
        status: 'pending',
        topics: ['Memoization vs Tabulation', '0/1 Knapsack Pattern', 'Longest Common Subsequence', 'Greedy Interval Scheduling'],
        practice: 'Coin Change, Longest Increasing Subsequence, Jump Game',
        resources: 'Aditya Verma DP Playlist / NeetCode 150'
      },
      {
        id: 'node-5',
        title: 'Core CS Subjects (OS, DBMS, Networks, OOP)',
        stage: 'Technical Prep',
        duration: 'Day 8',
        status: 'pending',
        topics: ['OS: Threads, Deadlocks, Paging', 'DBMS: Normalization, ACID, SQL Joins, Indexing', 'CN: TCP 3-Way Handshake, DNS, HTTP/HTTPS', 'OOP: 4 Pillars & SOLID Principles'],
        practice: 'Write complex SQL queries (Window functions, Group by Having), OOP Design questions',
        resources: 'GateSmashers / Love Babbar CS Subjects Notes'
      },
      {
        id: 'node-6',
        title: 'System Design & Project Deep Dive',
        stage: 'Interview Strategy',
        duration: 'Day 9',
        status: 'pending',
        topics: ['High-level architecture of your resume projects', 'Database schema design', 'Rate limiting & Caching', 'Handling edge failures'],
        practice: 'Explain your resume project using STAR method in under 3 minutes',
        resources: 'Grokking the System Design Interview'
      },
      {
        id: 'node-7',
        title: 'HR Behavioral & Mock Interview Simulation',
        stage: 'Final Polish',
        duration: 'Day 10',
        status: 'pending',
        topics: ['STAR Method for Behavioral Qs', 'Company values & culture fit', 'Salary negotiation & questions to ask interviewer'],
        practice: 'Complete 2 full AI Mock Interviews with speech analysis',
        resources: 'Placement Helper AI Mock Simulator'
      }
    ];

    db.prepare(`
      INSERT INTO roadmaps (id, user_id, title, goal, duration, level, target_role, target_company, nodes_json, progress_pct)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'default-roadmap',
      'default-user',
      'Cognizant / SDE 10-Day Accelerated Placement Sprint',
      'Prepare for upcoming technical rounds, coding tests, and HR interviews',
      '10 Days',
      'Intermediate',
      'Software Development Engineer',
      'Cognizant',
      JSON.stringify(defaultRoadmapNodes),
      28
    );
  }

  // Seed default coding problems
  seedCodingProblems();

  // Seed default activities
  const existingActivities = db.prepare('SELECT count(*) as count FROM activities WHERE user_id = ?').get('default-user');
  if (existingActivities.count === 0) {
    db.prepare(`
      INSERT INTO activities (id, user_id, module, action, description, score)
      VALUES 
        ('act-1', 'default-user', 'coding', 'Solved Problem', 'Solved "Two Sum" in Python (Runtime: 42ms)', 100),
        ('act-2', 'default-user', 'resume', 'ATS Analysis', 'Resume scored 88/100 (Grade A)', 88),
        ('act-3', 'default-user', 'roadmap', 'Milestone Checked', 'Completed "Linear Data Structures Mastery"', 100),
        ('act-4', 'default-user', 'interview', 'Mock Interview', 'Technical Interview completed with score 82/100', 82)
    `).run();
  }
}

function seedCodingProblems() {
  const count = db.prepare('SELECT count(*) as count FROM coding_problems').get();
  if (count.count > 0) return;

  const problems = [
    {
      id: 'prob-1',
      slug: 'two-sum',
      title: 'Two Sum',
      difficulty: 'Easy',
      category: 'Arrays & Hashing',
      companies_json: JSON.stringify(['Google', 'Amazon', 'Cognizant', 'TCS Digital', 'Microsoft']),
      description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
      constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
      examples_json: JSON.stringify([
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
        },
        {
          input: 'nums = [3,2,4], target = 6',
          output: '[1,2]',
          explanation: 'nums[1] + nums[2] == 6, return [1, 2].'
        }
      ]),
      test_cases_json: JSON.stringify([
        { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
        { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
        { input: { nums: [3, 3], target: 6 }, expected: [0, 1] },
        { input: { nums: [1, 4, 8, 13, 19], target: 20 }, expected: [0, 4], hidden: true },
        { input: { nums: [-3, 4, 3, 90], target: 0 }, expected: [0, 2], hidden: true }
      ]),
      starter_code_json: JSON.stringify({
        python: 'class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your code here\n        pass\n',
        javascript: '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Write your code here\n}\n',
        cpp: '#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n};\n',
        java: 'import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[0];\n    }\n}\n'
      }),
      optimal_solution_json: JSON.stringify({
        approach: 'One-pass Hash Map',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        explanation: 'Iterate through the array once. For each element `nums[i]`, compute `complement = target - nums[i]`. If the complement exists in the hash map, return `[map[complement], i]`. Otherwise, store `nums[i]` with its index `i`.'
      }),
      hints_json: JSON.stringify([
        'A brute force O(N^2) checks every pair, but can you trade space for time?',
        'Can you use a Hash Table to look up the difference (target - current_val) in O(1) time?',
        'Remember you can insert elements into the map as you iterate in a single pass.'
      ])
    },
    {
      id: 'prob-2',
      slug: 'valid-parentheses',
      title: 'Valid Parentheses',
      difficulty: 'Easy',
      category: 'Stacks',
      companies_json: JSON.stringify(['Amazon', 'Cognizant', 'Infosys', 'Bloomberg', 'Google']),
      description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
      constraints: '1 <= s.length <= 10^4\n`s` consists of parentheses only `()[]{}`.',
      examples_json: JSON.stringify([
        { input: 's = "()"', output: 'true', explanation: 'Direct matching pair.' },
        { input: 's = "()[]{}"', output: 'true', explanation: 'All three pairs open and close correctly.' },
        { input: 's = "(]"', output: 'false', explanation: 'Mismatch bracket types.' }
      ]),
      test_cases_json: JSON.stringify([
        { input: { s: "()" }, expected: true },
        { input: { s: "()[]{}" }, expected: true },
        { input: { s: "(]" }, expected: false },
        { input: { s: "([)]" }, expected: false, hidden: true },
        { input: { s: "{[]}" }, expected: true, hidden: true }
      ]),
      starter_code_json: JSON.stringify({
        python: 'class Solution:\n    def isValid(self, s: str) -> bool:\n        # Write your code here\n        pass\n',
        javascript: '/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isValid(s) {\n    // Write your code here\n}\n',
        cpp: '#include <string>\n#include <stack>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        // Write your code here\n        return false;\n    }\n};\n',
        java: 'import java.util.*;\n\nclass Solution {\n    public boolean isValid(String s) {\n        // Write your code here\n        return false;\n    }\n}\n'
      }),
      optimal_solution_json: JSON.stringify({
        approach: 'Stack-based matching',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        explanation: 'Push open brackets onto a stack. When an enclosed bracket is encountered, pop the top element from the stack and verify it matches. If the stack is empty at the end, the string is valid.'
      }),
      hints_json: JSON.stringify([
        'Consider what data structure follows Last-In-First-Out (LIFO).',
        'When you see a closing bracket, it must match the most recently seen opening bracket.',
        'Watch out for edge cases where the string has an odd length or starts with a closing bracket.'
      ])
    },
    {
      id: 'prob-3',
      slug: 'longest-substring-without-repeating-characters',
      title: 'Longest Substring Without Repeating Characters',
      difficulty: 'Medium',
      category: 'Sliding Window',
      companies_json: JSON.stringify(['Amazon', 'Google', 'Microsoft', 'Cognizant', 'Adobe']),
      description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
      constraints: '0 <= s.length <= 5 * 10^4\n`s` consists of English letters, digits, symbols and spaces.',
      examples_json: JSON.stringify([
        { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with length 3.' },
        { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with length 1.' },
        { input: 's = "pwwkew"', output: '3', explanation: 'The answer is "wke", with length 3. Note that "pwke" is a subsequence, not substring.' }
      ]),
      test_cases_json: JSON.stringify([
        { input: { s: "abcabcbb" }, expected: 3 },
        { input: { s: "bbbbb" }, expected: 1 },
        { input: { s: "pwwkew" }, expected: 3 },
        { input: { s: "" }, expected: 0, hidden: true },
        { input: { s: "tmmzuxt" }, expected: 5, hidden: true }
      ]),
      starter_code_json: JSON.stringify({
        python: 'class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # Write your code here\n        pass\n',
        javascript: '/**\n * @param {string} s\n * @return {number}\n */\nfunction lengthOfLongestSubstring(s) {\n    // Write your code here\n}\n',
        cpp: '#include <string>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your code here\n        return 0;\n    }\n};\n',
        java: 'import java.util.*;\n\nclass Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your code here\n        return 0;\n    }\n}\n'
      }),
      optimal_solution_json: JSON.stringify({
        approach: 'Sliding Window with Hash Map',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(min(N, M)) where M is the charset size',
        explanation: 'Use two pointers `left` and `right`. Maintain a hash map of character to its most recent index. When a duplicate character is seen at `right`, slide `left = max(left, last_seen[char] + 1)`.'
      }),
      hints_json: JSON.stringify([
        'Can you use a sliding window with two pointers left and right?',
        'Store the last seen index of each character so you can jump left forward directly.'
      ])
    },
    {
      id: 'prob-4',
      slug: 'reverse-linked-list',
      title: 'Reverse Linked List',
      difficulty: 'Easy',
      category: 'Linked Lists',
      companies_json: JSON.stringify(['Amazon', 'Cognizant', 'TCS Digital', 'Microsoft', 'Apple']),
      description: 'Given the `head` of a singly linked list represented as an array of values, reverse the list, and return the reversed list.',
      constraints: 'The number of nodes in the list is the range [0, 5000].\n-5000 <= Node.val <= 5000',
      examples_json: JSON.stringify([
        { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]', explanation: 'Reversed order.' },
        { input: 'head = [1,2]', output: '[2,1]', explanation: 'Reversed 2 nodes.' },
        { input: 'head = []', output: '[]', explanation: 'Empty list remains empty.' }
      ]),
      test_cases_json: JSON.stringify([
        { input: { head: [1, 2, 3, 4, 5] }, expected: [5, 4, 3, 2, 1] },
        { input: { head: [1, 2] }, expected: [2, 1] },
        { input: { head: [] }, expected: [] },
        { input: { head: [99] }, expected: [99], hidden: true },
        { input: { head: [4, 7, 2, 9, 1] }, expected: [1, 9, 2, 7, 4], hidden: true }
      ]),
      starter_code_json: JSON.stringify({
        python: 'class Solution:\n    def reverseList(self, head: list[int]) -> list[int]:\n        # Write your code here\n        pass\n',
        javascript: '/**\n * @param {number[]} head\n * @return {number[]}\n */\nfunction reverseList(head) {\n    // Write your code here\n}\n',
        cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> reverseList(vector<int>& head) {\n        // Write your code here\n        return {};\n    }\n};\n',
        java: 'import java.util.*;\n\nclass Solution {\n    public int[] reverseList(int[] head) {\n        // Write your code here\n        return new int[0];\n    }\n}\n'
      }),
      optimal_solution_json: JSON.stringify({
        approach: 'Iterative 3-pointer reversal',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        explanation: 'Maintain `prev = None`, `curr = head`. For each node, preserve `next_node = curr.next`, point `curr.next = prev`, then advance `prev = curr` and `curr = next_node`.'
      }),
      hints_json: JSON.stringify([
        'Think about saving the next node before modifying current node\'s pointer.',
        'Can you solve it iteratively in O(1) space?'
      ])
    },
    {
      id: 'prob-5',
      slug: 'coin-change',
      title: 'Coin Change',
      difficulty: 'Medium',
      category: 'Dynamic Programming',
      companies_json: JSON.stringify(['Amazon', 'Google', 'Cognizant', 'Flipkart', 'Goldman Sachs']),
      description: 'You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.\n\nYou may assume that you have an infinite number of each kind of coin.',
      constraints: '1 <= coins.length <= 12\n1 <= coins[i] <= 2^31 - 1\n0 <= amount <= 10^4',
      examples_json: JSON.stringify([
        { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1' },
        { input: 'coins = [2], amount = 3', output: '-1', explanation: 'Cannot make 3 with only 2s.' },
        { input: 'coins = [1], amount = 0', output: '0', explanation: '0 amount needs 0 coins.' }
      ]),
      test_cases_json: JSON.stringify([
        { input: { coins: [1, 2, 5], amount: 11 }, expected: 3 },
        { input: { coins: [2], amount: 3 }, expected: -1 },
        { input: { coins: [1], amount: 0 }, expected: 0 },
        { input: { coins: [2, 5, 10, 1], amount: 27 }, expected: 4, hidden: true },
        { input: { coins: [186, 419, 83, 408], amount: 6249 }, expected: 20, hidden: true }
      ]),
      starter_code_json: JSON.stringify({
        python: 'class Solution:\n    def coinChange(self, coins: list[int], amount: int) -> int:\n        # Write your code here\n        pass\n',
        javascript: '/**\n * @param {number[]} coins\n * @param {number} amount\n * @return {number}\n */\nfunction coinChange(coins, amount) {\n    // Write your code here\n}\n',
        cpp: '#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        // Write your code here\n        return -1;\n    }\n};\n',
        java: 'import java.util.*;\n\nclass Solution {\n    public int coinChange(int[] coins, int amount) {\n        // Write your code here\n        return -1;\n    }\n}\n'
      }),
      optimal_solution_json: JSON.stringify({
        approach: 'Bottom-up DP (Unbounded Knapsack)',
        timeComplexity: 'O(amount * len(coins))',
        spaceComplexity: 'O(amount)',
        explanation: 'Initialize `dp` array of size `amount + 1` filled with infinity, with `dp[0] = 0`. For `i` from 1 to `amount`, for each `coin` in `coins`: if `i >= coin`, `dp[i] = min(dp[i], dp[i - coin] + 1)`. Return `dp[amount]` if not infinity else -1.'
      }),
      hints_json: JSON.stringify([
        'Greedy (picking largest coin) does NOT always work (e.g. coins=[1,3,4], amount=6).',
        'Use DP: what is the minimum coins needed for subproblem amount i?'
      ])
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO coding_problems (
      id, slug, title, difficulty, category, companies_json,
      description, constraints, examples_json, test_cases_json,
      starter_code_json, optimal_solution_json, hints_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of problems) {
    stmt.run(
      p.id, p.slug, p.title, p.difficulty, p.category, p.companies_json,
      p.description, p.constraints, p.examples_json, p.test_cases_json,
      p.starter_code_json, p.optimal_solution_json, p.hints_json
    );
  }
}
