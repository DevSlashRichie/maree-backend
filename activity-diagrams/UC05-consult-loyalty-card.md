Use Case No. 05
Number: UC05
Name: Consult the Loyalty Card
Description: The authenticated customer can view their loyalty card details, including current points balance, membership tier, and card information.
Actor(s): Customer
Preconditions:
The user must be logged into the system. The user must have an active loyalty account.
Postconditions:
The system displays the customer's loyalty card information including points, tier, and card details.
Special Requirements: None
Extension Points: None

### **Flow: Consult the Loyalty Card**

1. **Start**
2. Customer navigates to loyalty card section
3. System validates authentication token
4. System retrieves customer loyalty account data
5. System retrieves card details (card number, tier, points)
6. System masks sensitive card information
7. System returns loyalty card data
8. System renders loyalty card interface
9. Customer views loyalty card information
10. **End**

---

### **Optional Alternative**

**A1: Invalid Session Token**

* At step 3:

  * If token is invalid:

    * System redirects to login
    * End flow

**A2: No Loyalty Account**

* At step 4:

  * If customer has no loyalty account:

    * System displays "No loyalty account found" message
    * System prompts to create a loyalty account
    * End flow

**A3: Backend Error**

* At step 4 or 5:

  * If request fails:

    * System displays error message
    * Option to retry
    * End flow
