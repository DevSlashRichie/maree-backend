Use Case No. 04
Number: UC04
Name: Add the Loyalty Card to the Digital Wallet
Description: The authenticated customer can add their loyalty card to a digital wallet (e.g., Apple Wallet, Google Wallet) for quick access and seamless reward tracking.
Actor(s): Customer
Preconditions:
The user must be logged into the system. The user must have an active loyalty account with a valid card identifier.
Postconditions:
The loyalty card is successfully added to the user's digital wallet and can be accessed for future transactions.
Special Requirements: None
Extension Points: None

### **Flow: Add the Loyalty Card to the Digital Wallet**

1. **Start**
2. Customer navigates to loyalty card section
3. System validates authentication token
4. System retrieves customer loyalty card data
5. System displays loyalty card information
6. Customer selects "Add to Digital Wallet"
7. System generates digital wallet pass data
8. System validates wallet platform compatibility
9. System creates the wallet pass
10. System triggers wallet application
11. Customer confirms addition in wallet app
12. System confirms successful addition
13. System displays confirmation message
14. **End**

---

### **Optional Alternative**

**A1: No Loyalty Account**

* At step 4:

  * If customer has no loyalty account:

    * System displays "No loyalty account found" message
    * System prompts to create a loyalty account
    * End flow

**A2: Wallet Platform Not Supported**

* At step 8:

  * If platform is not compatible:

    * System displays "Wallet platform not supported" message
    * System provides list of supported platforms
    * End flow

**A3: Wallet Pass Creation Failed**

* At step 9 or 10:

  * If pass creation fails:

    * System displays error message
    * Option to retry
    * End flow

**A4: User Cancellation**

* At step 11:

  * If user cancels in wallet app:

    * System displays "Addition cancelled" message
    * End flow
