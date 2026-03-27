Use Case No. 13
Number: UC13
Name: Consult Operational Metrics and Reports
Description: The administrator or supervisor can view operational metrics and reports, including sales data, order statistics, customer analytics, and performance indicators.
Actor(s): Administrator, Supervisor
Preconditions:
The user must be logged into the system. The system must be operational with data available for reporting.
Postconditions:
The system displays comprehensive operational metrics and reports based on the selected parameters.
Special Requirements: None
Extension Points: None

### **Flow: Consult Operational Metrics and Reports**

1. **Start**
2. Administrator/Supervisor navigates to reports section
3. System validates authentication token and role
4. System displays available report types:

   * Sales reports
   * Order statistics
   * Customer analytics
   * Loyalty program metrics
   * Staff performance
5. Administrator/Supervisor selects report type
6. System prompts for report parameters:

   * Date range
   * Branch selection
   * Aggregation level
7. Administrator/Supervisor configures parameters
8. System validates parameters
9. System queries database for report data
10. System aggregates and processes data
11. System formats report for display
12. System renders report interface with charts and tables
13. Administrator/Supervisor views operational metrics
14. **End**

---

### **Optional Alternative**

**A1: Unauthorized Access**

* At step 3:

  * If user lacks administrator or supervisor privileges:

    * System displays "Access denied" message
    * System redirects to home page
    * End flow

**A2: Invalid Parameters**

* At step 8:

  * If parameters are invalid:

    * System displays validation error messages
    * Administrator/Supervisor must correct parameters
    * Resume flow at step 6

**A3: No Data Available**

* At step 9:

  * If no data matches the query:

    * System displays "No data available for selected parameters" message
    * Option to adjust parameters
    * Resume flow at step 6

**A4: Database Query Error**

* At step 9 or 10:

  * If query fails:

    * System displays error message
    * Option to retry
    * End flow
