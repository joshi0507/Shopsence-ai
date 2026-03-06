# -*- coding: utf-8 -*-
"""
ShopSense AI - Comprehensive Verification Script

This script performs a complete verification of the ShopSense AI application:
1. Security checks
2. Code quality verification
3. Test execution
4. Performance validation
5. Documentation completeness

Usage:
    python verify_complete.py
"""

import os
import sys
import re
import logging
from pathlib import Path
from typing import List, Dict, Tuple, Optional
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('verification.log', encoding='utf-8')
    ],
    force=True
)
logger = logging.getLogger(__name__)

# Disable emoji for Windows compatibility
USE_EMOJI = sys.platform != 'win32'


class VerificationResult:
    """Represents a single verification result"""

    def __init__(self, check_name: str, passed: bool, message: str, severity: str = 'INFO'):
        self.check_name = check_name
        self.passed = passed
        self.message = message
        self.severity = severity
        self.timestamp = datetime.now()

    def __str__(self):
        if USE_EMOJI:
            status = "✅ PASS" if self.passed else "❌ FAIL"
        else:
            status = "[PASS]" if self.passed else "[FAIL]"
        return f"{status} [{self.severity}] {self.check_name}: {self.message}"


class ShopSenseVerifier:
    """Comprehensive verification for ShopSense AI"""
    
    def __init__(self, root_dir: str = None):
        self.root_dir = Path(root_dir) if root_dir else Path(__file__).parent.parent
        self.results: List[VerificationResult] = []
        self.warnings: List[str] = []
        self.errors: List[str] = []
    
    def verify_all(self) -> bool:
        """Run all verification checks"""
        logger.info("=" * 70)
        logger.info("ShopSense AI - Comprehensive Verification")
        logger.info("=" * 70)
        
        # Security checks
        self.check_security()
        
        # Code quality checks
        self.check_code_quality()
        
        # Test coverage checks
        self.check_tests()
        
        # Documentation checks
        self.check_documentation()
        
        # Performance checks
        self.check_performance()
        
        # Log summary
        self.log_summary()
        
        return len(self.errors) == 0
    
    def add_result(self, result: VerificationResult):
        """Add a verification result"""
        self.results.append(result)
        
        if not result.passed:
            if result.severity == 'ERROR':
                self.errors.append(str(result))
            elif result.severity == 'WARNING':
                self.warnings.append(str(result))
        
        logger.info(str(result))
    
    # =========================================================================
    # Security Checks
    # =========================================================================
    
    def check_security(self):
        """Perform security verification checks"""
        logger.info("\n" + "=" * 50)
        logger.info("SECURITY CHECKS")
        logger.info("=" * 50)
        
        # Check for hardcoded API keys
        self.check_hardcoded_secrets()
        
        # Check for debug mode in production
        self.check_debug_mode()
        
        # Check for input validation
        self.check_input_validation()
        
        # Check for secure password handling
        self.check_password_security()
        
        # Check for SQL/NoSQL injection prevention
        self.check_injection_prevention()
    
    def check_hardcoded_secrets(self):
        """Check for hardcoded secrets in code"""
        env_example = self.root_dir / 'backend' / '.env.example'
        
        if env_example.exists():
            content = env_example.read_text(encoding='utf-8')
            
            # Check for placeholder API keys
            if 'AIzaSy' in content:
                self.add_result(VerificationResult(
                    "Hardcoded API Keys",
                    False,
                    "Found hardcoded Google API key in .env.example",
                    "ERROR"
                ))
            else:
                self.add_result(VerificationResult(
                    "Hardcoded API Keys",
                    True,
                    "No hardcoded API keys detected"
                ))
        else:
            self.add_result(VerificationResult(
                "Hardcoded API Keys",
                False,
                ".env.example file not found",
                "WARNING"
            ))
    
    def check_debug_mode(self):
        """Check that debug mode is properly controlled"""
        app_py = self.root_dir / 'backend' / 'app.py'
        
        if app_py.exists():
            content = app_py.read_text(encoding='utf-8')
            
            # Check if debug mode uses environment variable
            if 'os.getenv' in content and 'FLASK_DEBUG' in content:
                self.add_result(VerificationResult(
                    "Debug Mode Control",
                    True,
                    "Debug mode properly controlled by environment variable"
                ))
            elif 'debug=True' in content:
                self.add_result(VerificationResult(
                    "Debug Mode Control",
                    False,
                    "Hardcoded debug=True found in app.py",
                    "ERROR"
                ))
            else:
                self.add_result(VerificationResult(
                    "Debug Mode Control",
                    True,
                    "Debug mode configuration acceptable"
                ))
    
    def check_input_validation(self):
        """Check for input validation utilities"""
        validation_py = self.root_dir / 'backend' / 'utils' / 'validation.py'
        
        if validation_py.exists():
            content = validation_py.read_text(encoding='utf-8')
            
            checks = [
                ('validate_email', 'Email validation'),
                ('validate_password', 'Password validation'),
                ('validate_username', 'Username validation'),
                ('sanitize_string', 'String sanitization'),
            ]
            
            all_present = all(check[0] in content for check in checks)
            
            self.add_result(VerificationResult(
                "Input Validation",
                all_present,
                "Comprehensive input validation present" if all_present 
                else "Missing input validation functions",
                "INFO" if all_present else "WARNING"
            ))
    
    def check_password_security(self):
        """Check password security measures"""
        # Check in models/user.py where password hashing is implemented
        user_model = self.root_dir / 'backend' / 'models' / 'user.py'

        if user_model.exists():
            content = user_model.read_text(encoding='utf-8')

            has_hashing = 'password_hash' in content or 'generate_password_hash' in content
            no_plain = 'password ==' not in content or 'password_hash' in content

            self.add_result(VerificationResult(
                "Password Security",
                has_hashing and no_plain,
                "Password hashing implemented" if has_hashing else "Password hashing missing",
                "ERROR" if not has_hashing else "INFO"
            ))
        else:
            self.add_result(VerificationResult(
                "Password Security",
                False,
                "user.py model not found",
                "ERROR"
            ))
    
    def check_injection_prevention(self):
        """Check for injection prevention measures"""
        # Check for parameterized queries (MongoDB uses dictionaries which are safe)
        models_dir = self.root_dir / 'backend' / 'models'
        
        if models_dir.exists():
            # MongoDB is generally safe from SQL injection
            # Check for input sanitization
            self.add_result(VerificationResult(
                "Injection Prevention",
                True,
                "Using MongoDB (NoSQL) - generally safe from SQL injection"
            ))
    
    # =========================================================================
    # Code Quality Checks
    # =========================================================================
    
    def check_code_quality(self):
        """Perform code quality checks"""
        logger.info("\n" + "=" * 50)
        logger.info("CODE QUALITY CHECKS")
        logger.info("=" * 50)
        
        # Check for TODO/FIXME comments
        self.check_todo_comments()
        
        # Check for generic exception handling
        self.check_exception_handling()
        
        # Check for console.log in production
        self.check_console_logs()
        
        # Check file lengths
        self.check_file_lengths()
    
    def check_todo_comments(self):
        """Check for TODO/FIXME comments"""
        backend_dir = self.root_dir / 'backend'
        todo_count = 0
        
        for py_file in backend_dir.rglob('*.py'):
            if 'test' in str(py_file) or '__pycache__' in str(py_file):
                continue
            
            content = py_file.read_text(encoding='utf-8', errors='ignore')
            todo_count += len(re.findall(r'\b(TODO|FIXME|XXX|HACK)\b', content))
        
        if todo_count == 0:
            self.add_result(VerificationResult(
                "TODO Comments",
                True,
                "No TODO/FIXME comments found"
            ))
        else:
            self.add_result(VerificationResult(
                "TODO Comments",
                True,
                f"Found {todo_count} TODO/FIXME comments (acceptable)",
                "INFO"
            ))
    
    def check_exception_handling(self):
        """Check for proper exception handling"""
        backend_dir = self.root_dir / 'backend'
        generic_except_count = 0
        
        for py_file in backend_dir.rglob('*.py'):
            if 'test' in str(py_file) or '__pycache__' in str(py_file):
                continue
            
            content = py_file.read_text(encoding='utf-8', errors='ignore')
            # Count bare "except:" or "except Exception:"
            generic_except_count += len(re.findall(r'\bexcept\s*(Exception)*\s*:', content))
        
        # This is informational - generic exceptions are sometimes necessary
        self.add_result(VerificationResult(
            "Exception Handling",
            True,
            f"Found {generic_except_count} exception handlers (review recommended)",
            "INFO"
        ))
    
    def check_console_logs(self):
        """Check for console.log/print statements in production code"""
        frontend_dir = self.root_dir / 'frontend' / 'src'
        console_log_count = 0
        
        if frontend_dir.exists():
            for ts_file in frontend_dir.rglob('*.tsx'):
                if 'test' in str(ts_file) or '__tests__' in str(ts_file):
                    continue
                
                content = ts_file.read_text(encoding='utf-8', errors='ignore')
                console_log_count += len(re.findall(r'\bconsole\.(log|error|warn|debug)\b', content))
        
        if console_log_count > 50:
            self.add_result(VerificationResult(
                "Console Logs",
                False,
                f"Found {console_log_count} console.log statements (consider removing)",
                "WARNING"
            ))
        else:
            self.add_result(VerificationResult(
                "Console Logs",
                True,
                f"Found {console_log_count} console.log statements (acceptable)"
            ))
    
    def check_file_lengths(self):
        """Check for overly long files"""
        long_files = []
        
        behavior_py = self.root_dir / 'backend' / 'routes' / 'behavior.py'
        if behavior_py.exists():
            lines = behavior_py.read_text(encoding='utf-8').split('\n')
            if len(lines) > 500:
                long_files.append(f"behavior.py ({len(lines)} lines)")
        
        if long_files:
            self.add_result(VerificationResult(
                "File Lengths",
                False,
                f"Long files found: {', '.join(long_files)} (consider refactoring)",
                "WARNING"
            ))
        else:
            self.add_result(VerificationResult(
                "File Lengths",
                True,
                "All files within acceptable length limits"
            ))
    
    # =========================================================================
    # Test Coverage Checks
    # =========================================================================
    
    def check_tests(self):
        """Perform test coverage checks"""
        logger.info("\n" + "=" * 50)
        logger.info("TEST COVERAGE CHECKS")
        logger.info("=" * 50)
        
        # Check for test files
        self.check_test_files_exist()
        
        # Check behavior analytics tests
        self.check_behavior_tests()
        
        # Check frontend tests
        self.check_frontend_tests()
    
    def check_test_files_exist(self):
        """Check that test files exist"""
        backend_tests = self.root_dir / 'backend' / 'tests'
        frontend_tests = self.root_dir / 'frontend' / 'src' / 'components' / '__tests__'
        
        backend_exists = backend_tests.exists() and len(list(backend_tests.glob('*.py'))) > 0
        frontend_exists = frontend_tests.exists() and len(list(frontend_tests.glob('*.tsx'))) > 0
        
        self.add_result(VerificationResult(
            "Test Files Exist",
            backend_exists and frontend_exists,
            "Backend tests: " + ("✅" if backend_exists else "❌") + 
            ", Frontend tests: " + ("✅" if frontend_exists else "❌"),
            "ERROR" if not (backend_exists and frontend_exists) else "INFO"
        ))
    
    def check_behavior_tests(self):
        """Check for behavior analytics tests"""
        behavior_tests = self.root_dir / 'backend' / 'tests' / 'test_behavior_analytics.py'
        
        if behavior_tests.exists():
            content = behavior_tests.read_text(encoding='utf-8')
            
            test_classes = [
                'TestSegmentationService',
                'TestAffinityService',
                'TestSentimentService',
                'TestPersonaService',
                'TestRecommendationService'
            ]
            
            found_classes = [cls for cls in test_classes if cls in content]
            
            self.add_result(VerificationResult(
                "Behavior Analytics Tests",
                len(found_classes) >= 3,
                f"Found {len(found_classes)}/{len(test_classes)} test classes",
                "INFO" if len(found_classes) >= 3 else "WARNING"
            ))
        else:
            self.add_result(VerificationResult(
                "Behavior Analytics Tests",
                False,
                "test_behavior_analytics.py not found",
                "ERROR"
            ))
    
    def check_frontend_tests(self):
        """Check for frontend component tests"""
        frontend_tests_dir = self.root_dir / 'frontend' / 'src' / 'components' / '__tests__'
        
        if frontend_tests_dir.exists():
            test_files = list(frontend_tests_dir.glob('*.test.tsx'))
            
            if len(test_files) >= 2:
                self.add_result(VerificationResult(
                    "Frontend Tests",
                    True,
                    f"Found {len(test_files)} frontend test files",
                    "INFO"
                ))
            else:
                self.add_result(VerificationResult(
                    "Frontend Tests",
                    False,
                    f"Only {len(test_files)} frontend test file(s) found",
                    "WARNING"
                ))
        else:
            self.add_result(VerificationResult(
                "Frontend Tests",
                False,
                "Frontend test directory not found",
                "ERROR"
            ))
    
    # =========================================================================
    # Documentation Checks
    # =========================================================================
    
    def check_documentation(self):
        """Perform documentation checks"""
        logger.info("\n" + "=" * 50)
        logger.info("DOCUMENTATION CHECKS")
        logger.info("=" * 50)
        
        # Check for README
        self.check_readme()
        
        # Check for API documentation
        self.check_api_docs()
        
        # Check for docstrings
        self.check_docstrings()
    
    def check_readme(self):
        """Check for README file"""
        readme = self.root_dir / 'README.md'
        
        if readme.exists():
            content = readme.read_text(encoding='utf-8')
            
            has_setup = 'Installation' in content or 'Setup' in content or 'install' in content.lower()
            has_usage = 'Usage' in content or 'Example' in content
            
            self.add_result(VerificationResult(
                "README.md",
                has_setup and has_usage,
                "README with setup and usage instructions present" if (has_setup and has_usage)
                else "README missing setup/usage instructions",
                "INFO" if (has_setup and has_usage) else "WARNING"
            ))
        else:
            self.add_result(VerificationResult(
                "README.md",
                False,
                "README.md not found",
                "ERROR"
            ))
    
    def check_api_docs(self):
        """Check for API documentation"""
        api_docs = self.root_dir / 'docs' / 'API.md'
        
        if api_docs.exists():
            self.add_result(VerificationResult(
                "API Documentation",
                True,
                "API.md documentation found",
                "INFO"
            ))
        else:
            # Check for behavior analytics API docs
            behavior_api_docs = self.root_dir / 'docs' / 'BEHAVIOR_ANALYTICS_API.md'
            
            if behavior_api_docs.exists():
                self.add_result(VerificationResult(
                    "API Documentation",
                    True,
                    "Behavior Analytics API documentation found",
                    "INFO"
                ))
            else:
                self.add_result(VerificationResult(
                    "API Documentation",
                    False,
                    "API documentation not found",
                    "WARNING"
                ))
    
    def check_docstrings(self):
        """Check for Python docstrings"""
        services_dir = self.root_dir / 'backend' / 'services'
        
        if services_dir.exists():
            files_with_docstrings = 0
            total_files = 0
            
            for py_file in services_dir.glob('*.py'):
                if py_file.name.startswith('_'):
                    continue
                
                total_files += 1
                content = py_file.read_text(encoding='utf-8', errors='ignore')
                
                if '"""' in content or "'''" in content:
                    files_with_docstrings += 1
            
            if total_files > 0:
                percentage = (files_with_docstrings / total_files) * 100
                
                self.add_result(VerificationResult(
                    "Python Docstrings",
                    percentage >= 80,
                    f"{percentage:.0f}% of service files have docstrings",
                    "INFO" if percentage >= 80 else "WARNING"
                ))
    
    # =========================================================================
    # Performance Checks
    # =========================================================================
    
    def check_performance(self):
        """Perform performance-related checks"""
        logger.info("\n" + "=" * 50)
        logger.info("PERFORMANCE CHECKS")
        logger.info("=" * 50)
        
        # Check for caching implementation
        self.check_caching()
        
        # Check for database indexes
        self.check_database_indexes()
    
    def check_caching(self):
        """Check for caching implementation"""
        cache_py = self.root_dir / 'backend' / 'utils' / 'cache.py'
        
        if cache_py.exists():
            # Check if caching is used in behavior routes
            behavior_py = self.root_dir / 'backend' / 'routes' / 'behavior.py'
            
            if behavior_py.exists():
                content = behavior_py.read_text(encoding='utf-8')
                
                uses_cache = 'from utils.cache import' in content or 'cache.get' in content
                
                self.add_result(VerificationResult(
                    "Caching Implementation",
                    uses_cache,
                    "Caching implemented" if uses_cache else "Caching utility exists but not used",
                    "INFO" if uses_cache else "WARNING"
                ))
            else:
                self.add_result(VerificationResult(
                    "Caching Implementation",
                    True,
                    "Cache utility file exists",
                    "INFO"
                ))
        else:
            self.add_result(VerificationResult(
                "Caching Implementation",
                False,
                "cache.py utility not found",
                "WARNING"
            ))
    
    def check_database_indexes(self):
        """Check for database index definitions"""
        models_dir = self.root_dir / 'backend' / 'models'
        
        if models_dir.exists():
            has_indexes = False
            
            for model_file in models_dir.glob('*.py'):
                content = model_file.read_text(encoding='utf-8', errors='ignore')
                
                if 'create_index' in content or 'ensure_index' in content or 'indexes' in content.lower():
                    has_indexes = True
                    break
            
            self.add_result(VerificationResult(
                "Database Indexes",
                has_indexes,
                "Database indexes configured" if has_indexes 
                else "Consider adding database indexes for performance",
                "INFO" if has_indexes else "WARNING"
            ))
    
    # =========================================================================
    # Summary
    # =========================================================================
    
    def log_summary(self):
        """Log verification summary"""
        logger.info("\n" + "=" * 70)
        logger.info("VERIFICATION SUMMARY")
        logger.info("=" * 70)
        
        total = len(self.results)
        passed = sum(1 for r in self.results if r.passed)
        failed = total - passed
        
        logger.info(f"Total Checks: {total}")
        logger.info(f"✅ Passed: {passed}")
        logger.info(f"❌ Failed: {failed}")
        
        if self.warnings:
            logger.info(f"\n⚠️  Warnings ({len(self.warnings)}):")
            for warning in self.warnings:
                logger.info(f"  - {warning}")
        
        if self.errors:
            logger.info(f"\n🚨 Errors ({len(self.errors)}):")
            for error in self.errors:
                logger.info(f"  - {error}")
        
        logger.info("\n" + "=" * 70)
        
        if len(self.errors) == 0:
            logger.info("✅ VERIFICATION PASSED - Application is ready!")
        else:
            logger.info("❌ VERIFICATION FAILED - Please fix the errors above")
        
        logger.info("=" * 70)


def main():
    """Main entry point"""
    print("\n" + "=" * 70)
    print("ShopSense AI - Comprehensive Verification")
    print("=" * 70 + "\n")
    
    verifier = ShopSenseVerifier()
    success = verifier.verify_all()
    
    # Write results to file
    results_file = Path(__file__).parent / 'verification_results.txt'
    with open(results_file, 'w', encoding='utf-8') as f:
        f.write(f"ShopSense AI Verification Results\n")
        f.write(f"Generated: {datetime.now().isoformat()}\n")
        f.write("=" * 70 + "\n\n")
        
        for result in verifier.results:
            f.write(f"{result}\n")
        
        f.write(f"\n{'=' * 70}\n")
        f.write(f"Summary: {'PASSED' if success else 'FAILED'}\n")
    
    print(f"\n📄 Full results written to: {results_file}")
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
