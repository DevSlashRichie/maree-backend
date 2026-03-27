Use Case No. 20
Number: UC20
Name: Update Existing Product Details
Description: The administrator or supervisor can update product details including name, description, price, variants, and images.
Actor(s): Administrator, Supervisor
Preconditions:
The user must be logged into the system. The product must exist in the system.
Postconditions:
The product details are updated and reflected in the menu and ordering system.
Special Requirements: None
Extension Points: None

### **Flow: Update Existing Product Details**

1. **Start**
2. Administrator/Supervisor navigates to product management
3. System validates authentication token and role
4. System retrieves product list
5. Administrator/Supervisor selects a product to update
6. System retrieves current product details
7. System displays product edit form with current values
8. Administrator/Supervisor modifies product details:

   * Name
   * Description
   * Price
   * Variants
   * Images
   * Category
9. System validates each field
10. System displays updated product preview
11. Administrator/Supervisor confirms changes
12. System saves updated product to database
13. System logs changes in audit trail
14. System updates product in menu
15. System displays confirmation message
16. **End**

---

### **Optional Alternative**

**A1: Unauthorized Access**

* At step 3:

  * If user lacks administrator or supervisor privileges:

    * System displays "Access denied" message
    * System redirects to home page
    * End flow

**A2: Product Not Found**

* At step 6:

  * If product no longer exists:

    * System displays "Product not found" message
    * System refreshes product list
    * Resume flow at step 4

**A3: Invalid Input**

* At step 9:

  * If validation fails:

    * System displays specific validation error messages
    * Administrator/Supervisor must correct values
    * Resume flow at step 8

**A4: Cancel Changes**

* At step 11:

  * If administrator/supervisor cancels:

    * System discards unsaved changes
    * End flow

**A5: Database Save Error**

* At step 12:

  * If save operation fails:

    * System displays error message
    * Option to retry
    * End flow
