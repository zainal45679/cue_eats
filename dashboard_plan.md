# Main Dashboard Architecture (Role-Based)

You are absolutely right! The dashboard should act as a tailored "cockpit" for whoever is logging in. Since your current system heavily revolves around **Back-of-House (Inventory, Procurement, and Supply Chain)**, the dashboard widgets should pull from POs, GRNs, STOs, Internal Requests, and Live Stock.

Here is the proposed breakdown of what we should show on the main dashboard for each role:

## 1. Admin / Owner (Global Oversight)
The Admin needs a bird's-eye view of the financial and operational health of the entire supply chain across *all* locations.

**Key Metric Boxes (Top Row):**
*   **Total Inventory Value:** Total cost of all stock currently sitting across all locations.
*   **Monthly Procurement Spend:** Total value of approved Purchase Orders this month.
*   **Pending PO Approvals:** Number of high-value POs requiring their explicit sign-off.
*   **Global Low Stock Alerts:** Count of critical ingredients running dangerously low across the chain.

**Charts & Tables (Main Body):**
*   **Procurement vs. Consumption Chart:** A bar chart comparing incoming GRNs (purchases) vs outgoing consumption over the last 30 days.
*   **Top Suppliers by Spend:** A quick table showing which suppliers are being paid the most.
*   **Recent Activity Feed:** A unified feed of major events (e.g., "Branch A raised a PO for $500", "Central Kitchen dispatched STO to Branch B").

---

## 2. Manager (Location / Branch Oversight)
The Manager only cares about *their specific branch* or location. They need to ensure they have enough stock to run operations and manage their staff's requests.

**Key Metric Boxes (Top Row):**
*   **Local Inventory Value:** Cost of stock at their location.
*   **Pending Indents (Internal Requests):** Staff requests waiting for the Manager's approval.
*   **Incoming Deliveries (STOs/POs):** Dispatches or orders expected to arrive today/this week.
*   **Local Low Stock:** Ingredients running low *at their branch*.

**Charts & Tables (Main Body):**
*   **Action Required Table:** A combined list of GRNs that need to be verified and Indents that need approval.
*   **Recent Stock Movements:** A mini-ledger showing recent inwards and outwards at their location.
*   **Quick Links:** Large buttons to quickly "Raise Internal Request" or "Check Live Stock".

---

## 3. Staff (Operational & Daily Tasks)
Staff members need a highly functional, action-oriented view. They don't need high-level financial metrics; they just need to know what they have to do right now.

**Key Metric Boxes (Top Row):**
*   **My Draft Requests:** Indents they started but haven't submitted.
*   **Pending GRNs:** Items that arrived at the loading bay waiting to be received into the system.
*   **Pending Dispatches:** (If at central warehouse) STOs that need to be packed and shipped.

**Charts & Tables (Main Body):**
*   **My Tasks / To-Do List:** A direct list of actionable items (e.g., "Receive PO-0012", "Pack STO-0045").
*   **Quick Actions:** Massive, touch-friendly buttons: "Create Indent", "Receive Goods (GRN)", "Issue Stock".

---

## Open Questions

> [!IMPORTANT] 
> 1. Do you agree with focusing the dashboard heavily on Inventory and Procurement right now, or do you also have Sales/Billing data you want to pull in?
> 2. How are roles defined in the database right now? Do users have a `role` column (e.g., `'admin'`, `'manager'`, `'staff'`), or are we using a permission package like Spatie?
> 3. Should the widgets follow the same Petpooja style (small white cards with colored left borders) that we just implemented for the index pages?

## Proposed Implementation Plan

1.  **Backend (`DashboardController.php`)**: Update the controller to check the authenticated user's role. Run specific Eloquent queries based on the role to fetch the exact metrics defined above.
2.  **Frontend (`dashboard/index.tsx`)**: Replace the placeholder skeleton loading screens with conditional rendering blocks (`{user.role === 'admin' && <AdminDashboard />}`).
3.  **UI Components**: Build Recharts components for the Admin charts and reuse our new Petpooja-style `<Card>` components for the metric boxes.

## User Review Required
Please review the metrics for the 3 roles above. Let me know if you want to add, remove, or change any of the metrics before we start building the Dashboard!
