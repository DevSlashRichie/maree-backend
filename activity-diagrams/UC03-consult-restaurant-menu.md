Use Case No. 03
Number: UC03
Name: Consult the Restaurant Menu
Description: The user can view the restaurant's available menu, including active products and their variants.
Actor(s): Guest and Customer
Preconditions: None
Postconditions: None
Special Requirements: None
Extension Points: None

### **Flow: Consult the Restaurant Menu**

1. **Start**
2. User accesses the system (web or mobile interface)
3. System initializes request
4. System checks if the user has an active session

   * If **yes** -> validate authentication token
   * If **no** -> continue as guest
5. System requests menu data from backend
6. Backend retrieves products from database
7. Backend filters products:

   * Include only products with status = "enabled"
8. Backend retrieves associated variants for each product
9. Backend returns structured menu data
10. System renders menu interface
11. User views list of products and variants
12. **End**

---

### **Optional Alternative**

**A1: Invalid Session Token**

* At step 4:

  * If token is invalid -> discard session
  * Continue as guest
  * Resume flow at step 5

**A2: No Available Products**

* At step 7:

  * If no enabled products found:

    * System displays "No menu available" message
    * End flow

**A3: Backend Error**

* At step 5 or 6:

  * If request fails:

    * System displays error message
    * Option to retry
    * End flow
