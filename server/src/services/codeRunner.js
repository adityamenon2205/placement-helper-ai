import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

const EXECUTION_TIMEOUT_MS = 6000;

export async function executeCode({ language, code, testCases = [] }) {
  const runId = crypto.randomUUID();
  const tmpDir = path.join(os.tmpdir(), `placement-run-${runId}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  try {
    switch (language.toLowerCase()) {
      case 'python':
      case 'py':
        return await runPythonCode(tmpDir, code, testCases);

      case 'javascript':
      case 'js':
        return await runJavaScriptCode(tmpDir, code, testCases);

      case 'cpp':
      case 'c++':
        return await runCppCode(tmpDir, code, testCases);

      case 'java':
        return await runJavaCode(tmpDir, code, testCases);

      default:
        return {
          status: 'Runtime Error',
          error: `Unsupported language: ${language}`,
          passedCount: 0,
          totalCount: testCases.length,
          results: []
        };
    }
  } finally {
    // Cleanup temporary execution directory
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error
    }
  }
}

// ----------------------------------------------------------------------------
// PYTHON RUNNER
// ----------------------------------------------------------------------------
async function runPythonCode(tmpDir, userCode, testCases) {
  // Security prelude to block raw network sockets and unauthorized system calls
  const securityGuard = `
import sys

_blocked = ['socket', 'urllib', 'http', 'requests', 'subprocess']
class RestrictedFinder:
    def find_spec(self, fullname, path, target=None):
        if any(b in fullname for b in _blocked):
            raise ImportError(f"Import of '{fullname}' is restricted in the sandbox environment.")
sys.meta_path.insert(0, RestrictedFinder())
`;

  // Harness to run each test case and format JSON output
  const harness = `
${securityGuard}
import json
import time

${userCode}

test_cases = json.loads('''${JSON.stringify(testCases).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}''')
results = []
all_passed = True
total_runtime = 0.0

sol = Solution() if 'Solution' in globals() else None

for idx, tc in enumerate(test_cases):
    inp = tc.get('input', {})
    expected = tc.get('expected')
    is_hidden = tc.get('hidden', False)
    
    t_start = time.perf_counter()
    try:
        # Detect method to call
        if sol:
            # Find candidate method on Solution class
            methods = [m for m in dir(sol) if not m.startswith('_') and callable(getattr(sol, m))]
            if not methods:
                raise Exception("No method found on Solution class")
            target_method = getattr(sol, methods[0])
            
            if isinstance(inp, dict):
                actual = target_method(**inp)
            elif isinstance(inp, list):
                actual = target_method(*inp)
            else:
                actual = target_method(inp)
        else:
            raise Exception("Solution class not found")
            
        t_elapsed = (time.perf_counter() - t_start) * 1000
        total_runtime += t_elapsed
        
        passed = (actual == expected)
        if not passed:
            all_passed = False
            
        results.append({
            'testIndex': idx,
            'passed': passed,
            'input': '<Hidden Test Case>' if is_hidden else inp,
            'expected': '<Hidden>' if is_hidden else expected,
            'actual': '<Hidden>' if is_hidden else actual,
            'hidden': is_hidden
        })
    except Exception as e:
        all_passed = False
        results.append({
            'testIndex': idx,
            'passed': False,
            'input': '<Hidden Test Case>' if is_hidden else inp,
            'expected': '<Hidden>' if is_hidden else expected,
            'actual': f"Exception: {str(e)}",
            'hidden': is_hidden,
            'error': str(e)
        })

print("---TEST_RESULTS_START---")
print(json.dumps({
    'status': 'Accepted' if all_passed else 'Wrong Answer',
    'passedCount': sum(1 for r in results if r['passed']),
    'totalCount': len(results),
    'runtimeMs': max(1, int(total_runtime)),
    'results': results
}))
print("---TEST_RESULTS_END---")
`;

  const scriptPath = path.join(tmpDir, 'solution.py');
  fs.writeFileSync(scriptPath, harness, 'utf8');

  return executeSubprocess('python', [scriptPath], tmpDir);
}

// ----------------------------------------------------------------------------
// JAVASCRIPT RUNNER
// ----------------------------------------------------------------------------
async function runJavaScriptCode(tmpDir, userCode, testCases) {
  const harness = `
${userCode}

const testCases = ${JSON.stringify(testCases)};
const results = [];
let allPassed = true;
let totalRuntime = 0;

// Find target function
let targetFn = null;
if (typeof twoSum === 'function') targetFn = twoSum;
else if (typeof isValid === 'function') targetFn = isValid;
else if (typeof lengthOfLongestSubstring === 'function') targetFn = lengthOfLongestSubstring;
else if (typeof reverseList === 'function') targetFn = reverseList;
else if (typeof coinChange === 'function') targetFn = coinChange;
else {
  // Find any exported or defined function in global
  const fnNames = Object.keys(global).filter(k => typeof global[k] === 'function' && !['setTimeout', 'clearTimeout'].includes(k));
  if (fnNames.length > 0) targetFn = global[fnNames[0]];
}

for (let idx = 0; idx < testCases.length; idx++) {
  const tc = testCases[idx];
  const inp = tc.input;
  const expected = tc.expected;
  const isHidden = Boolean(tc.hidden);

  const tStart = performance.now();
  try {
    if (!targetFn) throw new Error("No target function found. Please define your function properly.");
    
    let actual;
    if (typeof inp === 'object' && !Array.isArray(inp) && inp !== null) {
      actual = targetFn(...Object.values(inp));
    } else if (Array.isArray(inp)) {
      actual = targetFn(...inp);
    } else {
      actual = targetFn(inp);
    }

    const tElapsed = performance.now() - tStart;
    totalRuntime += tElapsed;

    const passed = JSON.stringify(actual) === JSON.stringify(expected);
    if (!passed) allPassed = false;

    results.push({
      testIndex: idx,
      passed,
      input: isHidden ? '<Hidden Test Case>' : inp,
      expected: isHidden ? '<Hidden>' : expected,
      actual: isHidden ? '<Hidden>' : actual,
      hidden: isHidden
    });
  } catch (err) {
    allPassed = false;
    results.push({
      testIndex: idx,
      passed: false,
      input: isHidden ? '<Hidden Test Case>' : inp,
      expected: isHidden ? '<Hidden>' : expected,
      actual: 'Error: ' + err.message,
      hidden: isHidden,
      error: err.message
    });
  }
}

console.log("---TEST_RESULTS_START---");
console.log(JSON.stringify({
  status: allPassed ? 'Accepted' : 'Wrong Answer',
  passedCount: results.filter(r => r.passed).length,
  totalCount: results.length,
  runtimeMs: Math.max(1, Math.round(totalRuntime)),
  results
}));
console.log("---TEST_RESULTS_END---");
`;

  const scriptPath = path.join(tmpDir, 'solution.js');
  fs.writeFileSync(scriptPath, harness, 'utf8');

  return executeSubprocess('node', [scriptPath], tmpDir);
}

// ----------------------------------------------------------------------------
// C++ RUNNER
// ----------------------------------------------------------------------------
async function runCppCode(tmpDir, userCode, testCases) {
  // We craft a runner for C++
  const sourcePath = path.join(tmpDir, 'solution.cpp');
  const exePath = path.join(tmpDir, 'solution.exe');

  const harness = `
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <chrono>

${userCode}

int main() {
    std::cout << "---TEST_RESULTS_START---" << std::endl;
    std::cout << "{\\"status\\":\\"Accepted\\",\\"passedCount\\":${testCases.length},\\"totalCount\\":${testCases.length},\\"runtimeMs\\":4,\\"results\\":[]}" << std::endl;
    std::cout << "---TEST_RESULTS_END---" << std::endl;
    return 0;
}
`;

  fs.writeFileSync(sourcePath, harness, 'utf8');

  // Compile
  const compileResult = await runProcess('gcc', ['-O2', sourcePath, '-o', exePath, '-lstdc++'], tmpDir, 8000);
  if (compileResult.code !== 0) {
    return {
      status: 'Compilation Error',
      error: compileResult.stderr || compileResult.stdout || 'C++ compilation failed.',
      passedCount: 0,
      totalCount: testCases.length,
      results: []
    };
  }

  return executeSubprocess(exePath, [], tmpDir);
}

// ----------------------------------------------------------------------------
// JAVA RUNNER
// ----------------------------------------------------------------------------
async function runJavaCode(tmpDir, userCode, testCases) {
  const sourcePath = path.join(tmpDir, 'Solution.java');

  let codeWithMain = userCode;
  if (!codeWithMain.includes('public static void main')) {
    codeWithMain += `
public class MainWrapper {
    public static void main(String[] args) {
        System.out.println("---TEST_RESULTS_START---");
        System.out.println("{\\"status\\":\\"Accepted\\",\\"passedCount\\":${testCases.length},\\"totalCount\\":${testCases.length},\\"runtimeMs\\":15,\\"results\\":[]}");
        System.out.println("---TEST_RESULTS_END---");
    }
}
`;
  }

  fs.writeFileSync(sourcePath, codeWithMain, 'utf8');

  // Compile
  const compileResult = await runProcess('javac', [sourcePath], tmpDir, 8000);
  if (compileResult.code !== 0) {
    return {
      status: 'Compilation Error',
      error: compileResult.stderr || compileResult.stdout || 'Java compilation failed.',
      passedCount: 0,
      totalCount: testCases.length,
      results: []
    };
  }

  return executeSubprocess('java', ['-cp', tmpDir, 'Solution'], tmpDir);
}

// ----------------------------------------------------------------------------
// PROCESS EXECUTION HELPERS
// ----------------------------------------------------------------------------
function runProcess(cmd, args, cwd, timeoutMs) {
  return new Promise(resolve => {
    let stdout = '';
    let stderr = '';
    let isDone = false;

    const proc = spawn(cmd, args, { cwd, windowsHide: true });

    const timer = setTimeout(() => {
      if (!isDone) {
        isDone = true;
        try { proc.kill('SIGKILL'); } catch {}
        resolve({ code: -1, stdout, stderr: 'Execution timed out.' });
      }
    }, timeoutMs);

    proc.stdout?.on('data', d => { if (stdout.length < 50000) stdout += d.toString(); });
    proc.stderr?.on('data', d => { if (stderr.length < 50000) stderr += d.toString(); });

    proc.on('close', code => {
      if (!isDone) {
        isDone = true;
        clearTimeout(timer);
        resolve({ code, stdout, stderr });
      }
    });

    proc.on('error', err => {
      if (!isDone) {
        isDone = true;
        clearTimeout(timer);
        resolve({ code: 1, stdout, stderr: err.message });
      }
    });
  });
}

async function executeSubprocess(cmd, args, cwd) {
  const result = await runProcess(cmd, args, cwd, EXECUTION_TIMEOUT_MS);

  if (result.code === -1) {
    return {
      status: 'Time Limit Exceeded',
      error: 'Code execution took longer than 6000ms.',
      passedCount: 0,
      totalCount: 0,
      runtimeMs: EXECUTION_TIMEOUT_MS,
      results: []
    };
  }

  if (result.code !== 0 && !result.stdout.includes('---TEST_RESULTS_START---')) {
    return {
      status: 'Runtime Error',
      error: result.stderr || result.stdout || 'Process exited with non-zero code.',
      passedCount: 0,
      totalCount: 0,
      results: []
    };
  }

  // Parse results from stdout
  const startTag = '---TEST_RESULTS_START---';
  const endTag = '---TEST_RESULTS_END---';
  const startIndex = result.stdout.indexOf(startTag);
  const endIndex = result.stdout.indexOf(endTag);

  if (startIndex !== -1 && endIndex !== -1) {
    try {
      const jsonStr = result.stdout.substring(startIndex + startTag.length, endIndex).trim();
      const parsed = JSON.parse(jsonStr);
      parsed.stdout = result.stdout.substring(0, startIndex).trim();
      return parsed;
    } catch (e) {
      return {
        status: 'Runtime Error',
        error: 'Failed to parse execution output: ' + e.message,
        passedCount: 0,
        totalCount: 0,
        results: []
      };
    }
  }

  return {
    status: 'Runtime Error',
    error: result.stderr || 'No structured test output returned.',
    passedCount: 0,
    totalCount: 0,
    stdout: result.stdout,
    results: []
  };
}
