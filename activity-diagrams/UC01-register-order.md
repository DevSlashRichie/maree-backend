Use Case No. 01
Number: UC01
Name: Register an Order
Description: The authenticated user creates a new order by selecting products.
Actor(s): Customer
Preconditions:
The user must be logged in.
Postconditions:
A new order is created in the system with status "pending".
Special Requirements: None
Extension Points: None

### **Flow: Register an Order**

1. **Start**
2. Customer navigates to the restaurant menu
3. System displays available products and variants
4. Customer selects a product
5. System displays product details and customization options
6. Customer customizes product (optional) 
7. Customer adds product to shopping cart 
8. Customer reviews shopping cart
9. Customer confirms the order
10. System validates all cart items are still available
11. System calculates order total
12. System creates the order record with status "pending"
13. System assigns order to the authenticated customer
14. System displays order confirmation with order details
15. **End**

---

### **Optional Alternative**

**A1: Product No Longer Available**

* At step 10:

  * If product status is now "unavailable":

    * System removes product from cart
    * System notifies customer of the unavailable item
    * Customer decides to continue or cancel
    * If continue -> resume flow at step 9
    * If cancel -> end flow

**A2: Empty Cart**

* At step 9:

  * If cart is empty:

    * System displays "Cart is empty" message
    * End flow

