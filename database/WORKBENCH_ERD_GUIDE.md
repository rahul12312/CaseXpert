# MySQL Workbench - ERD Diagram Instructions

## 📊 How to Create ERD Diagram in MySQL Workbench

### Method 1: Auto-Generate from Existing Database (Recommended)

1. **Open MySQL Workbench**

2. **Connect to your MySQL server**
   - Click on your connection in the home screen

3. **Run the SQL script first**
   - Open a new SQL tab (Ctrl+T)
   - Paste the entire `casexpert_workbench.sql` content
   - Execute the script (Ctrl+Shift+Enter or ⚡ icon)
   - Wait for completion

4. **Create ERD from Database**
   - Go to: **Database** → **Reverse Engineer...**
   - Select your connection → **Next**
   - Select schema: `casexpert_db` → **Next**
   - Select all tables → **Next**
   - Click **Execute** → **Next**
   - Click **Close**

5. **View the ERD**
   - The ERD will open automatically
   - You'll see all tables with relationships

6. **Customize the Diagram**
   - Drag tables to arrange them
   - Right-click on table → **Edit Table** to modify
   - Use **Model** → **Diagram Properties** to customize appearance

### Method 2: Create ERD Manually

1. **Create New Model**
   - File → New Model (Ctrl+N)

2. **Add EER Diagram**
   - Double-click "Add Diagram"

3. **Add Tables**
   - Use the table icon in the left toolbar
   - Click on canvas to place table
   - Double-click table to edit columns

4. **Add Relationships**
   - Use the relationship tools (1:1, 1:N, N:M)
   - Click source table, then target table
   - Configure foreign keys

5. **Forward Engineer to Database**
   - Database → Forward Engineer
   - Follow wizard to create database

## 🎨 ERD Layout Recommendations

### Suggested Table Arrangement:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   [users]                                                   │
│      │                                                      │
│      ├──────────┬──────────┬──────────┐                    │
│      │          │          │          │                    │
│      ▼          ▼          ▼          ▼                    │
│  [lawyers]  [cases]   [bookings] [payments]                │
│      │          │          │                               │
│      │          ├──────────┤                               │
│      │          │          │                               │
│      ▼          ▼          ▼                               │
│  [reviews] [documents]  [chat]                             │
│                                                             │
│                      [notifications]                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Color Coding (Optional):

1. **Core Tables** (Blue): users, lawyers, cases
2. **Transaction Tables** (Green): bookings, payments
3. **Content Tables** (Yellow): documents, chat
4. **Supporting Tables** (Orange): reviews, notifications

To apply colors:
- Right-click table → **Edit Table**
- Go to **Color** tab
- Select color

## 📋 ERD Diagram Elements

### Tables in the ERD:

1. **users** (Central table)
   - Primary Key: id
   - Unique: email, phone
   - Relationships: 1:1 with lawyers, 1:N with cases, bookings, payments

2. **lawyers** (Extended user profile)
   - Primary Key: id
   - Foreign Key: user_id → users.id
   - Relationships: 1:N with cases, bookings, reviews

3. **cases** (Legal cases)
   - Primary Key: id
   - Foreign Keys: user_id → users.id, lawyer_id → lawyers.id
   - Relationships: 1:N with documents, chat

4. **documents** (Files)
   - Primary Key: id
   - Foreign Keys: case_id → cases.id, uploaded_by → users.id

5. **chat** (Messages)
   - Primary Key: id
   - Foreign Keys: case_id → cases.id, sender_id → users.id, receiver_id → users.id

6. **bookings** (Appointments)
   - Primary Key: id
   - Foreign Keys: user_id → users.id, lawyer_id → lawyers.id, case_id → cases.id

7. **payments** (Transactions)
   - Primary Key: id
   - Foreign Keys: user_id → users.id, booking_id → bookings.id, case_id → cases.id

8. **reviews** (Ratings)
   - Primary Key: id
   - Foreign Keys: lawyer_id → lawyers.id, user_id → users.id, case_id → cases.id

9. **notifications** (Alerts)
   - Primary Key: id
   - Foreign Key: user_id → users.id

## 🔗 Relationship Types

### One-to-One (1:1)
- users ←→ lawyers
  - Identifying: No
  - Mandatory: No (user can exist without being a lawyer)

### One-to-Many (1:N)
- users → cases (as client)
- lawyers → cases (as assigned lawyer)
- cases → documents
- cases → chat
- users → bookings
- lawyers → bookings
- users → payments
- lawyers → reviews

### Cascade Rules
- **ON DELETE CASCADE**: When parent is deleted, children are deleted
  - users → lawyers, cases, bookings, payments, chat, documents
  - cases → documents, chat
  - lawyers → cases (SET NULL), bookings, reviews

- **ON DELETE SET NULL**: When parent is deleted, FK is set to NULL
  - lawyers → cases.lawyer_id
  - bookings → payments.booking_id
  - cases → payments.case_id

## 🛠️ Workbench Tips

### Zoom and Navigation
- **Zoom In**: Ctrl + Mouse Wheel Up
- **Zoom Out**: Ctrl + Mouse Wheel Down
- **Pan**: Hold Space + Drag
- **Fit to Screen**: Ctrl + 0

### Table Operations
- **Add Column**: Double-click table → Columns tab → Add
- **Edit Column**: Click on column name
- **Delete Column**: Select column → Delete key
- **Reorder Columns**: Drag and drop

### Relationship Operations
- **Edit Relationship**: Double-click on relationship line
- **Delete Relationship**: Select line → Delete key
- **Change Cardinality**: Edit relationship → Foreign Key tab

### Export ERD
1. **As Image**:
   - File → Export → Export as PNG/SVG/PDF
   - Choose location and format

2. **As SQL**:
   - Database → Forward Engineer
   - Generate SQL script

3. **Print**:
   - File → Print
   - Configure page layout

## 📊 ERD Best Practices

1. **Table Placement**
   - Place parent tables at top
   - Child tables below
   - Group related tables together

2. **Minimize Line Crossings**
   - Arrange tables to reduce relationship line crossings
   - Use routing points if needed

3. **Consistent Naming**
   - Use snake_case for table and column names
   - Prefix foreign keys with table name (e.g., user_id)

4. **Documentation**
   - Add comments to tables and columns
   - Use meaningful names
   - Document constraints

5. **Visual Clarity**
   - Use colors to group related tables
   - Keep adequate spacing between tables
   - Use layers for complex diagrams

## 🔍 Verify Your ERD

After creating the ERD, verify:

✅ All 9 tables are present
✅ All foreign key relationships are shown
✅ Cardinality is correct (1:1, 1:N)
✅ Primary keys are marked (🔑 icon)
✅ Foreign keys are marked (🔗 icon)
✅ Indexes are created
✅ Data types are correct

## 📤 Export Options

### 1. Export as SQL Script
```
Database → Forward Engineer
→ Select options
→ Save SQL file
```

### 2. Export as Image
```
File → Export
→ Choose format (PNG/SVG/PDF)
→ Set resolution
→ Save
```

### 3. Export Model
```
File → Export
→ Export as Single Page PDF
→ Configure layout
→ Save
```

## 🎯 Quick Actions

### Keyboard Shortcuts
- **New Model**: Ctrl+N
- **New Diagram**: Ctrl+T
- **Save**: Ctrl+S
- **Undo**: Ctrl+Z
- **Redo**: Ctrl+Y
- **Delete**: Delete key
- **Select All**: Ctrl+A

### Mouse Actions
- **Select**: Left-click
- **Multi-select**: Ctrl + Left-click
- **Pan**: Space + Drag
- **Zoom**: Ctrl + Mouse Wheel

## 📝 Notes

1. **Auto-Layout**: Model → Auto-Layout (arranges tables automatically)
2. **Validation**: Model → Validate (checks for errors)
3. **Synchronize**: Database → Synchronize Model (sync with database)
4. **Compare**: Database → Compare Schemas (compare models)

## 🚀 Next Steps

After creating the ERD:

1. Review all relationships
2. Verify foreign key constraints
3. Check indexes
4. Add table/column comments
5. Export as image for documentation
6. Forward engineer to create database
7. Test with sample data

---

**Your ERD is now ready to visualize the CaseXpert database structure!** 📊
