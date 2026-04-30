# CaseXpert Database - Entity Relationship Diagram

## 📊 Database Structure Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CASEXPERT DATABASE                          │
│                     Legal Platform Database Schema                  │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔷 Core Entities

### 1. USERS (Central Entity)
```
┌──────────────────────────────┐
│          USERS               │
├──────────────────────────────┤
│ PK  id                       │
│ UQ  email                    │
│ UQ  phone                    │
│     name                     │
│     password (hashed)        │
│     user_type (ENUM)         │
│     profile_image            │
│     is_verified              │
│     is_active                │
│     created_at               │
│     updated_at               │
└──────────────────────────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
    LAWYERS            CASES (as client)
```

### 2. LAWYERS (Extended User Profile)
```
┌──────────────────────────────┐
│         LAWYERS              │
├──────────────────────────────┤
│ PK  id                       │
│ FK  user_id → users.id       │
│     specialization           │
│     experience               │
│     languages (JSON)         │
│     rating (0-5)             │
│     total_reviews            │
│     consultation_fee         │
│     bar_council_number       │
│     license_verified         │
│     availability_status      │
│     city, state, country     │
└──────────────────────────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
    CASES (assigned)    BOOKINGS
```

### 3. CASES (Legal Cases)
```
┌──────────────────────────────┐
│          CASES               │
├──────────────────────────────┤
│ PK  id                       │
│ UQ  case_number              │
│ FK  user_id → users.id       │
│ FK  lawyer_id → lawyers.id   │
│     title                    │
│     description              │
│     case_type                │
│     status (ENUM)            │
│     priority (ENUM)          │
│     next_hearing_date        │
│     created_at               │
└──────────────────────────────┘
         │
         ├──────────────────┬──────────────┐
         │                  │              │
         ▼                  ▼              ▼
    DOCUMENTS           CHAT          BOOKINGS
```

## 🔗 Relationships Diagram

```
                    ┌─────────────┐
                    │    USERS    │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐   ┌──────────┐
    │ LAWYERS  │    │  CASES   │   │BOOKINGS  │
    └────┬─────┘    └────┬─────┘   └────┬─────┘
         │               │              │
         │               ├──────────────┤
         │               │              │
         ▼               ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ REVIEWS  │   │DOCUMENTS │   │PAYMENTS  │
    └──────────┘   └──────────┘   └──────────┘
                        │
                        ▼
                   ┌──────────┐
                   │   CHAT   │
                   └──────────┘
```

## 📋 Detailed Relationships

### USERS Relationships
```
USERS (1) ──────────── (1) LAWYERS
      │
      ├─ (1) ──────── (N) CASES [as client]
      │
      ├─ (1) ──────── (N) BOOKINGS [as client]
      │
      ├─ (1) ──────── (N) PAYMENTS
      │
      ├─ (1) ──────── (N) REVIEWS [as reviewer]
      │
      ├─ (1) ──────── (N) DOCUMENTS [uploader]
      │
      ├─ (1) ──────── (N) CHAT [sender/receiver]
      │
      └─ (1) ──────── (N) NOTIFICATIONS
```

### LAWYERS Relationships
```
LAWYERS (1) ──────── (N) CASES [assigned lawyer]
        │
        ├─ (1) ──────── (N) BOOKINGS
        │
        ├─ (1) ──────── (N) REVIEWS [reviewed lawyer]
        │
        └─ (1) ──────── (N) PAYMENTS [earnings]
```

### CASES Relationships
```
CASES (1) ──────── (N) DOCUMENTS
      │
      ├─ (1) ──────── (N) CHAT
      │
      ├─ (1) ──────── (N) BOOKINGS [optional link]
      │
      └─ (1) ──────── (N) PAYMENTS [optional link]
```

## 🎯 Cardinality Notation

- **1:1** (One-to-One): `USERS ←→ LAWYERS`
- **1:N** (One-to-Many): `USERS → CASES`, `CASES → DOCUMENTS`
- **N:M** (Many-to-Many): Implemented via junction tables if needed

## 🔑 Key Constraints

### Primary Keys (PK)
- All tables have `id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY`

### Foreign Keys (FK)
```sql
lawyers.user_id        → users.id
cases.user_id          → users.id
cases.lawyer_id        → lawyers.id
documents.case_id      → cases.id
documents.uploaded_by  → users.id
chat.case_id           → cases.id
chat.sender_id         → users.id
bookings.user_id       → users.id
bookings.lawyer_id     → lawyers.id
payments.user_id       → users.id
reviews.lawyer_id      → lawyers.id
reviews.user_id        → users.id
```

### Unique Constraints (UQ)
```sql
users.email
users.phone
lawyers.user_id
lawyers.bar_council_number
cases.case_number
bookings.booking_number
payments.transaction_id
```

## 📊 Complete ER Diagram (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                          CASEXPERT ER DIAGRAM                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │    USERS    │
                              │─────────────│
                              │ PK id       │
                              │ UQ email    │
                              │ UQ phone    │
                              │    name     │
                              │    password │
                              │    type     │
                              └──────┬──────┘
                                     │
                ┌────────────────────┼────────────────────┐
                │                    │                    │
                │ 1:1                │ 1:N                │ 1:N
                ▼                    ▼                    ▼
        ┌──────────────┐     ┌──────────────┐    ┌──────────────┐
        │   LAWYERS    │     │    CASES     │    │  BOOKINGS    │
        │──────────────│     │──────────────│    │──────────────│
        │ PK id        │     │ PK id        │    │ PK id        │
        │ FK user_id   │─┐   │ FK user_id   │    │ FK user_id   │
        │    special.  │ │   │ FK lawyer_id │◄───│ FK lawyer_id │
        │    rating    │ │   │    title     │    │    time      │
        │    fee       │ │   │    status    │─┐  │    status    │
        └──────┬───────┘ │   └──────┬───────┘ │  └──────┬───────┘
               │         │          │         │         │
               │ 1:N     │          │ 1:N     │         │ 1:N
               ▼         │          ▼         │         ▼
        ┌──────────────┐ │   ┌──────────────┐│  ┌──────────────┐
        │   REVIEWS    │ │   │  DOCUMENTS   ││  │   PAYMENTS   │
        │──────────────│ │   │──────────────││  │──────────────│
        │ PK id        │ │   │ PK id        ││  │ PK id        │
        │ FK lawyer_id │◄┘   │ FK case_id   │┘  │ FK user_id   │
        │ FK user_id   │     │ FK upload_by │   │ FK booking_id│
        │    rating    │     │    file_url  │   │    amount    │
        │    review    │     │    type      │   │    status    │
        └──────────────┘     └──────────────┘   └──────────────┘
                                     │
                                     │ 1:N
                                     ▼
                              ┌──────────────┐
                              │     CHAT     │
                              │──────────────│
                              │ PK id        │
                              │ FK case_id   │
                              │ FK sender_id │
                              │    message   │
                              │    is_read   │
                              └──────────────┘

        ┌──────────────────────────────────────────────────┐
        │         SUPPORTING TABLES                        │
        ├──────────────────────────────────────────────────┤
        │  • notifications (user notifications)            │
        │  • activity_logs (audit trail)                   │
        │  • password_resets (password recovery)           │
        │  • email_verifications (email verification)      │
        └──────────────────────────────────────────────────┘
```

## 🔄 Data Flow Examples

### 1. User Registration Flow
```
1. INSERT INTO users (name, email, password, user_type)
2. IF user_type = 'lawyer' THEN
   INSERT INTO lawyers (user_id, specialization, ...)
3. INSERT INTO email_verifications (user_id, token)
4. SEND verification email
```

### 2. Case Creation Flow
```
1. INSERT INTO cases (user_id, title, description)
   → Auto-generates case_number (trigger)
2. INSERT INTO notifications (user_id, type='case_created')
3. INSERT INTO activity_logs (user_id, action='case_created')
```

### 3. Booking Flow
```
1. INSERT INTO bookings (user_id, lawyer_id, booking_time)
   → Auto-generates booking_number (trigger)
2. INSERT INTO payments (user_id, booking_id, amount)
3. UPDATE lawyers SET availability_status
4. INSERT INTO notifications (lawyer_id, type='new_booking')
```

### 4. Review Submission Flow
```
1. INSERT INTO reviews (lawyer_id, user_id, rating, review_text)
   → Trigger: update_lawyer_rating_after_review
2. UPDATE lawyers SET rating, total_reviews
   → Auto-calculated by trigger
```

## 📈 Indexes Strategy

### Primary Indexes
- All `id` columns (clustered index)

### Foreign Key Indexes
- All FK columns for join performance

### Search Indexes
- `users.email`, `users.phone` (unique + indexed)
- `lawyers.specialization`, `lawyers.city`
- `cases.status`, `cases.case_type`
- `bookings.booking_time`, `bookings.status`
- `payments.status`, `payments.transaction_id`

### Fulltext Indexes
- `lawyers.bio` (for lawyer search)
- `cases.title`, `cases.description` (for case search)
- `documents.document_title` (for document search)
- `chat.message` (for message search)

## 🎨 Color Legend (for visual diagrams)

- 🔵 **Blue**: Core entities (users, lawyers, cases)
- 🟢 **Green**: Transaction entities (bookings, payments)
- 🟡 **Yellow**: Content entities (documents, chat)
- 🟠 **Orange**: Supporting entities (reviews, notifications)
- 🔴 **Red**: Security entities (password_resets, verifications)

## 📝 Notes

1. **Cascading Deletes**: Most FKs use `ON DELETE CASCADE` to maintain referential integrity
2. **Soft Deletes**: Some tables have `is_deleted` flags for soft delete capability
3. **Timestamps**: All tables have `created_at` and `updated_at` for audit trails
4. **JSON Fields**: Used for flexible data structures (languages, metadata, etc.)
5. **Generated Columns**: Auto-calculated fields (end_time, final_amount)
6. **Triggers**: Automated data updates (ratings, case numbers, etc.)

---

**Created**: November 28, 2024  
**Version**: 1.0  
**For**: CaseXpert Legal Platform
