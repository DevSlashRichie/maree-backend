Use Case No. 25
Number: UC25
Name: Manage Product Availability
Description: The administrator, supervisor, or authorized staff can mark products as available or unavailable, controlling their visibility in the menu and ordering system.
Actor(s): Administrator, Supervisor, Cashier, Waiter
Preconditions: The user must be logged into the system with valid credentials. The product must exist in the system.
Postconditions: The product's availability status is updated,
Special Requirements: Status changes must be immediate. Products in active orders are not affected.
Extension Points: None

### **Flow: Manage Product Availability**

1. **Start**
2. Staff member navigates to product management
3. System validates authentication token
4. System retrieves product list
5. System displays products with current availability status
6. Staff member selects a product
7. System displays product details with availability toggle
8. Staff member changes availability status:

   * Available -> Unavailable
   * Unavailable -> Available
9. System validates the status change
10. System updates product availability in database
11. System updates product visibility in menu
12. System logs status change
13. System displays confirmation message
14. **End**

---

### **Optional Alternative**

**A1: Invalid Session Token**

* At step 3:

  * If token is invalid:

    * System redirects to login
    * End flow

**A2: Product Not Found**

* At step 7:

  * If product no longer exists:

    * System displays "Product not found" message
    * System refreshes product list
    * Resume flow at step 4

**A3: Status Already Set**

* At step 9:

  * If selected status matches current status:

    * System displays "Status already set" message
    * End flow

**A4: Product in Active Orders**

* At step 10:

  * If marking unavailable and product is in pending orders:

    * System displays warning about active orders
    * Staff member can confirm or cancel
    * If confirm -> product marked unavailable for new orders only
    * If cancel -> end flow

**A5: Database Update Error**

* At step 10:

  * If update fails:

    * System displays error message
    * Option to retry
    * End flow
