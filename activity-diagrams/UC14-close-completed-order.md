Use Case No. 14
Number: UC14
Name: Close a Completed Order
Description: The cashier or waiter can close a completed order.
Actor(s): Cashier, Waiter
Preconditions:
The user must be logged into the system. The order must exist with status "ready" or "completed".
Postconditions: None
Special Requirements: None
Extension Points: None

### **Flow: Close a Completed Order**

1. **Start**
2. Cashier/Waiter navigates to order management
3. System validates authentication token
4. System retrieves orders with status "ready" or "completed"
5. Cashier/Waiter selects an order to close
6. System displays order details
7. Cashier/Waiter verifies order completeness
8. System calculates and awards loyalty points
9. System updates order status to "closed"
10. System archives order in history
11. System generates receipt
11. System displays closure confirmation
13. **End**

---

### **Optional Alternative**

**A1: Order Not Ready**

* At step 7:

  * If order has items not marked as ready:

    * System displays warning about pending items
    * Cashier/Waiter can wait or force close (if authorized)
    * If force close -> resume flow at step 8
    * If wait -> end flow

**A2: Loyalty Points Redemption**

* At step 9:

  * If customer wants to redeem points:

    * System initiates reward redemption flow
    * After redemption, resume flow at step 10

**A4: Invalid Session**

* At step 3:

  * If token is invalid:

    * System redirects to login
    * End flow
