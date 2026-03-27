Use Case No. 28
Number: UC28
Name: Views Orders History
Description: The authenticated user can view their order history, including past orders with details, status, and associated information.
Actor(s): Customer, Cashier, Waiter, Administrator, Supervisor
Preconditions:
The user must be logged into the system with valid credentials.
Postconditions:
The system displays the user's order history based on their access level and filters.
Special Requirements: None
Extension Points: None

### **Flow: Views Orders History**

1. **Start**
2. User navigates to order history
3. System validates authentication token
4. System determines user role and access level
5. System displays filter options:

   * Date range
   * Order status
   * Search by order number
6. User configures filters (optional)
7. System validates filter parameters
8. System retrieves orders from database
9. System applies filters and sorting
10. System returns order history data
11. System renders order history interface
12. User views order history with details
13. **End**

---

### **Optional Alternative**

**A1: Invalid Session Token**

* At step 3:

  * If token is invalid:

    * System redirects to login
    * End flow

**A2: Invalid Filter Parameters**

* At step 7:

  * If filter parameters are invalid:

    * System displays validation error messages
    * User must correct filters
    * Resume flow at step 5

**A3: No Orders Found**

* At step 8 or 9:

  * If no orders match the criteria:

    * System displays "No orders found" message
    * Option to adjust filters
    * Resume flow at step 5

**A4: Backend Error**

* At step 8:

  * If request fails:

    * System displays error message
    * Option to retry
    * End flow
