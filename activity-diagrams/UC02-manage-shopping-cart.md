Use Case No. 02
Number: UC02
Name: Manage Shopping Cart
Description: The authenticated user can add, remove, and update quantities of products in the shopping cart before submitting an order.
Actor(s): Customer
Preconditions:
The user must be logged in.
Postconditions:
The shopping cart is updated with the selected products, quantities, and customizations.
Special Requirements: None
Extension Points: None

### **Flow: Manage Shopping Cart**

1. **Start**
2. Customer accesses the shopping cart
3. System displays current cart items with quantities and prices
4. Customer performs an action:

   * **Add product** -> navigate to menu and select product
   * **Remove product** -> select item and confirm removal
   * **Update quantity** -> modify quantity of existing item
5. System validates the requested changes
6. System updates cart state
7. System recalculates cart total
8. System displays updated cart
9. **End**

---

### **Optional Alternative**

**A1: Product Unavailable**

* At step 5:

  * If product status is "unavailable":

    * System displays "Product no longer available" message
    * Item is removed from cart
    * Resume flow at step 8

**A2: Exceeded Maximum Quantity**

* At step 5:

  * If requested quantity exceeds product limit:

    * System adjusts quantity to maximum allowed
    * System notifies customer of the adjustment
    * Resume flow at step 7

**A3: Empty Cart Action**

* At step 4:

  * If customer selects "Clear cart":

    * System removes all items
    * System displays "Cart is empty" message
    * End flow
