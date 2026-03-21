#!/usr/bin/env node

/**
 * CaseXpert Role-Based Separation - Quick Implementation Script
 * 
 * This script helps you implement the role-based separation step by step
 */

const fs = require('fs');
const path = require('path');

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(text) {
    log('\n' + '='.repeat(60), 'cyan');
    log(`  ${text}`, 'bright');
    log('='.repeat(60), 'cyan');
}

function step(number, text) {
    log(`\n${number}. ${text}`, 'yellow');
}

function success(text) {
    log(`✅ ${text}`, 'green');
}

function warning(text) {
    log(`⚠️  ${text}`, 'yellow');
}

function error(text) {
    log(`❌ ${text}`, 'red');
}

function checkFile(filepath) {
    return fs.existsSync(filepath);
}

async function main() {
    header('CaseXpert Role-Based Separation Implementation');

    log('\nThis script will guide you through implementing strict role separation.', 'cyan');
    log('Please follow each step carefully.\n', 'cyan');

    // Check current directory
    const rootDir = process.cwd();
    log(`Working directory: ${rootDir}`, 'blue');

    // Step 1: Check if migration exists
    step(1, 'Database Migration Check');
    const migrationPath = path.join(rootDir, 'backend', 'migrations', 'add_assignment_status.js');

    if (checkFile(migrationPath)) {
        success('Migration file found!');
        log('\n   To run the migration:');
        log('   $ cd backend');
        log('   $ node migrations/add_assignment_status.js\n');
    } else {
        error('Migration file not found!');
        log('   Expected at: backend/migrations/add_assignment_status.js');
    }

    // Step 2: Check implementation guide
    step(2, 'Implementation Guide Check');
    const guidePath = path.join(rootDir, 'ROLE_BASED_SEPARATION_IMPLEMENTATION.md');

    if (checkFile(guidePath)) {
        success('Implementation guide found!');
        log('   Read it: ROLE_BASED_SEPARATION_IMPLEMENTATION.md\n');
    } else {
        error('Implementation guide not found!');
    }

    // Step 3: List files that need updates
    step(3, 'Files Requiring Updates');

    const filesToUpdate = [
        {
            path: 'frontend/src/components/Navbar.jsx',
            purpose: 'Add role-specific navigation (USER vs LAWYER)',
            priority: 'HIGH'
        },
        {
            path: 'backend/models/Case.js',
            purpose: 'Add getUserCases() and getLawyerAcceptedCases() methods',
            priority: 'CRITICAL'
        },
        {
            path: 'backend/controllers/caseController.js',
            purpose: 'Update getCaseList() to be role-aware',
            priority: 'CRITICAL'
        },
        {
            path: 'backend/controllers/lawyerDashboardController.js',
            purpose: 'Add getAcceptedCases(), acceptCaseRequest(), rejectCaseRequest()',
            priority: 'HIGH'
        },
        {
            path: 'backend/routes/lawyerDashboardRoutes.js',
            purpose: 'Add routes for accepted cases and reject requests',
            priority: 'HIGH'
        },
        {
            path: 'backend/controllers/bookingController.js',
            purpose: 'Fix accept/reject to UPDATE status, not DELETE',
            priority: 'CRITICAL'
        },
        {
            path: 'frontend/src/pages/LawyerAcceptedCases.jsx',
            purpose: 'Create new page for lawyer accepted cases',
            priority: 'MEDIUM'
        },
        {
            path: 'frontend/src/App.jsx',
            purpose: 'Add route for /lawyer/accepted-cases',
            priority: 'MEDIUM'
        }
    ];

    filesToUpdate.forEach((file, index) => {
        const exists = checkFile(path.join(rootDir, file.path));
        const status = exists ? '✅' : '❌';
        const priorityColor = file.priority === 'CRITICAL' ? 'red' :
            file.priority === 'HIGH' ? 'yellow' : 'blue';

        log(`\n   ${status} ${file.path}`, exists ? 'green' : 'red');
        log(`      Purpose: ${file.purpose}`, 'cyan');
        log(`      Priority: ${file.priority}`, priorityColor);
    });

    // Step 4: Implementation order
    step(4, 'Recommended Implementation Order');

    const implementationOrder = [
        '1️⃣  Run database migration (backend/migrations/add_assignment_status.js)',
        '2️⃣  Update Case model (add getUserCases and getLawyerAcceptedCases methods)',
        '3️⃣  Update caseController.js (make getCaseList role-aware)',
        '4️⃣  Update lawyerDashboardController.js (add accept/reject logic)',
        '5️⃣  Update bookingController.js (fix consultation accept/reject)',
        '6️⃣  Update lawyerDashboardRoutes.js (add new routes)',
        '7️⃣  Update Navbar.jsx (role-specific navigation)',
        '8️⃣  Create LawyerAcceptedCases.jsx page',
        '9️⃣  Update App.jsx (add new routes)',
        '🔟 Test everything thoroughly'
    ];

    implementationOrder.forEach(item => {
        log(`\n   ${item}`, 'cyan');
    });

    // Step 5: Testing checklist
    step(5, 'Testing Checklist');

    log('\n   As USER:');
    log('   □ Create a case → Should appear in /cases (Case Tracker)', 'blue');
    log('   □ Book consultation → Should appear in /my-bookings as PENDING', 'blue');
    log('   □ Case should NOT appear in lawyer dashboard', 'blue');

    log('\n   As LAWYER:');
    log('   □ Login → See lawyer-specific navbar', 'blue');
    log('   □ Dashboard → Only shows ACCEPTED cases', 'blue');
    log('   □ Case Requests → See REQUESTED cases', 'blue');
    log('   □ Accept case → Moves to Accepted Cases', 'blue');
    log('   □ Consultations → Shows all with status badges', 'blue');

    // Step 6: Key security rules
    step(6, 'CRITICAL SECURITY RULES');

    log('\n   ⛔ USER case tracker is PRIVATE', 'red');
    log('   ⛔ Lawyers ONLY see ACCEPTED cases', 'red');
    log('   ⛔ Consultations persist with status (never delete)', 'red');
    log('   ⛔ Separate navbars with ZERO overlap', 'red');
    log('   ⛔ Role verification on EVERY API call', 'red');

    // Final message
    header('Ready to Begin Implementation');

    log('\nQuick Start Commands:', 'bright');
    log('\n1. Run database migration:', 'yellow');
    log('   cd backend');
    log('   node migrations/add_assignment_status.js');

    log('\n2. Review implementation guide:', 'yellow');
    log('   Open ROLE_BASED_SEPARATION_IMPLEMENTATION.md');

    log('\n3. Start development servers:', 'yellow');
    log('   Terminal 1: cd backend && npm run dev');
    log('   Terminal 2: cd frontend && npm run dev');

    log('\n4. Test with different roles:', 'yellow');
    log('   - Login as USER (client role)');
    log('   - Login as LAWYER (lawyer role)');
    log('   - Verify complete separation\n');

    success('Setup check complete! Follow the implementation guide.\n');
}

main().catch(error => {
    error('Script failed:', error);
    process.exit(1);
});
