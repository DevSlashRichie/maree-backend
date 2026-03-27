Use Case No. 16
Number: UC16
Name: Consult Incoming Orders
Description: The cashier, waiter, or kitchen staff can view incoming orders that require processing, preparation, or attention.
Actor(s): Cashier, Waiter
Preconditions:
The user must be logged into the system with valid credentials. The system must be operational with active orders.
Postconditions:
The system displays all incoming orders with their details, status, and required actions.
Special Requirements: None
Extension Points: None

### **Flow: Consult Incoming Orders**

1. **Start**
2. Staff member navigates to orders dashboard
3. System validates authentication token
4. System retrieves orders from database
5. System filters orders:

   * Include orders with status "pending", "preparing", "ready"
   * Filter by branch (if applicable)
6. System sorts orders by priority and time
7. System returns order list with details
8. System renders orders interface with real-time updates
9. Staff member views incoming orders
10. Staff member can filter or search orders
11. **End**

---

### **Optional Alternative**

**A1: Invalid Session Token**

* At step 3:

  * If token is invalid:

    * System redirects to login
    * End flow

**A2: No Incoming Orders**

* At step 5:

  * If no orders match the criteria:

    * System displays "No incoming orders" message
    * System continues to monitor for new orders
    * End flow

**A3: Backend Error**

* At step 4 or 5:

  * If request fails:

    * System displays error message
    * Option to retry
    * End flow

**A4: Real-Time Update Connection Lost**

* At step 8 or 9:

  * If WebSocket connection fails:

    * System displays warning message
    * System attempts to reconnect
    * Manual refresh option available
