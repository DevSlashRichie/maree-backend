Use Case No. 12
Number: UC12
Name: Consult Available Rewards
Description: The authenticated customer can view the list of available rewards that can be redeemed using their loyalty points.
Actor(s): Customer
Preconditions:
The user must be logged into the system. The user must have an active loyalty account.
Postconditions:
The system displays all available rewards with their point requirements and current availability status.
Special Requirements: None
Extension Points: None

### **Flow: Consult Available Rewards**

1. **Start**
2. Customer navigates to rewards section
3. System validates authentication token
4. System retrieves customer loyalty account
5. System retrieves available rewards from database
6. System filters rewards:

   * Include only rewards with status = "available"
   * Exclude rewards with zero stock
7. System retrieves customer's current points balance
8. System maps rewards with affordability status
9. System returns rewards list with details
10. System renders rewards interface
11. Customer views available rewards and required points
12. **End**

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

**A3: No Available Rewards**

* At step 6:

  * If no available rewards found:

    * System displays "No rewards available" message
    * End flow

**A4: Backend Error**

* At step 5 or 7:

  * If request fails:

    * System displays error message
    * Option to retry
    * End flow
