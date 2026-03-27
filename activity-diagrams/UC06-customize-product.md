Use Case No. 06
Number: UC06
Name: Customize Product
Description: The authenticated customer can customize a product by selecting options from available variants and modifications before adding it to the shopping cart.
Actor(s): Customer
Preconditions:
The user must be logged into the system. The product must have available customization options.
Postconditions:
The product is customized according to customer selections and ready to be added to the cart.
Special Requirements: None
Extension Points: None

### **Flow: Customize Product**

1. **Start**
2. Customer selects a product from the menu
3. System validates authentication token
4. System retrieves product details and customization options
5. System displays product information and available variants
6. Customer selects customization options:

   * Size, toppings, modifications, etc.
7. System validates each selection against product rules
8. System updates product price based on selections
9. System displays updated product summary with price
10. Customer confirms customization
11. System validates final configuration
12. System returns customized product ready for cart
13. **End**

---

### **Optional Alternative**

**A1: No Customization Options Available**

* At step 5:

  * If product has no customization options:

    * System displays product as-is
    * Customer can add directly to cart
    * End flow

**A2: Invalid Selection**

* At step 7:

  * If selection violates product rules:

    * System displays error message explaining the constraint
    * Customer must select a valid option
    * Resume flow at step 6

**A3: Exceeded Maximum Customizations**

* At step 6:

  * If maximum customizations reached:

    * System disables additional customization options
    * System displays "Maximum customizations reached" message
    * Resume flow at step 9
