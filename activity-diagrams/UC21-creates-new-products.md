Use Case No. 21
Number: UC21
Name: Creates New Products
Description: The administrator or supervisor can create new products with details including name, description, price, variants, images, and category assignment.
Actor(s): Administrator, Supervisor
Preconditions:
The user must be logged into the system. The system must be operational.
Postconditions:
A new product is created in the system and can be added to the menu and ordered by customers.
Special Requirements: None
Extension Points: None

### **Flow: Creates New Products**

1. **Start**
2. Administrator/Supervisor navigates to product management
3. System validates authentication token and role
4. System displays product creation form
5. Administrator/Supervisor enters product details:

   * Name
   * Description
   * Base price
   * Category
   * Variants (size, options)
   * Images
6. System validates each field
7. System checks product name uniqueness
8. System processes and validates images
9. System displays product preview
10. Administrator/Supervisor confirms creation
11. System saves product to database
12. System assigns default status (enabled)
13. System logs creation in audit trail
14. System displays confirmation with product details
15. **End**

---

### **Optional Alternative**

**A1: Unauthorized Access**

* At step 3:

  * If user lacks administrator or supervisor privileges:

    * System displays "Access denied" message
    * System redirects to home page
    * End flow

**A2: Duplicate Product Name**

* At step 7:

  * If product name already exists:

    * System displays "Product name already exists" message
    * Administrator/Supervisor must enter a different name
    * Resume flow at step 5

**A3: Invalid Input**

* At step 6:

  * If validation fails:

    * System displays specific validation error messages
    * Resume flow at step 5

**A4: Image Validation Error**

* At step 8:

  * If image format or size is invalid:

    * System displays image validation error message
    * Administrator/Supervisor must upload valid images
    * Resume flow at step 5

**A5: Cancel Creation**

* At step 10:

  * If administrator/supervisor cancels:

    * System discards product data
    * End flow

**A6: Database Save Error**

* At step 11:

  * If save operation fails:

    * System displays error message
    * Option to retry
    * End flow
