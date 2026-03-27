Use Case No. 24
Number: UC24
Name: Mark an Order as Ready
Description: The kitchen staff, waiter, or cashier can mark an order as ready when all items have been prepared and are ready for delivery or pickup.
Actor(s): Waiter, Cashier
Preconditions:
The user must be logged into the system. The order must exist with status "preparing" or similar.
Postconditions:
The order status is updated to "ready" and notifications will be sent to relevant staff and customers.
Special Requirements: Status change must trigger notifications. 
Extension Points: None

### **Flow: Mark an Order as Ready**

1. **Start**
2. Staff member navigates to order management
3. System validates authentication token
4. System retrieves orders with status "preparing"
5. System displays order list with preparation status
6. Staff member selects an order
7. System displays order details with item preparation status
8. Staff member verifies all items are prepared
9. Staff member marks order as ready
10. System validates order completion
11. System updates order status to "ready"
12. System triggers notifications:

    * Waiter notification
    * Customer notification (if configured)
13. System logs status change
14. System displays confirmation message
15. **End**

---

### **Optional Alternative**

**A1: Invalid Session Token**

* At step 3:

  * If token is invalid:

    * System redirects to login
    * End flow

**A2: Items Not Complete**

* At step 10:

  * If not all items are marked as prepared:

    * System displays warning about pending items
    * Staff member can mark all items as prepared or cancel
    * If mark all -> resume flow at step 11
    * If cancel -> end flow

**A3: Order Status Changed**

* At step 10:

  * If order status was changed by another user:

    * System displays "Order status has changed" message
    * System refreshes order details
    * Resume flow at step 7

**A4: Notification Failure**

* At step 12:

  * If notification sending fails:

    * System displays warning about notification failure
    * Order status is still updated
    * Flow continues
