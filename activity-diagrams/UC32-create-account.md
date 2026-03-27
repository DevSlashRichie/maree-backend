Use Case No. 32
Number: UC32
Name: Create an Account
Description: The guest user can create a new account in the system by providing registration details to access personalized features and services.
Actor(s): Guest
Preconditions:
The system must be operational. The user must not have an existing account with the provided email.
Postconditions:
A new user account is created and the user can log in with the provided credentials.
Special Requirements: Email must be unique.
Extension Points: None

### **Flow: Create an Account**

1. **Start**
2. Guest navigates to registration page
3. System displays registration form
4. Guest enters registration details:

   * Name
   * Email
   * Phone number
   * Password
   * Password confirmation
5. Guest accepts terms and conditions
6. Guest submits registration
7. System validates input fields
8. System checks email uniqueness
9. System validates password strength
10. System hashes password with Argon2id
11. System creates user account
12. System assigns default customer role
13. System sends verification email (optional)
14. System displays registration confirmation
15. System redirects to login page
16. **End**

---

### **Optional Alternative**

**A1: Email Already Exists**

* At step 8:

  * If email is already registered:

    * System displays "Email already registered" message
    * Option to login or reset password
    * End flow

**A2: Invalid Input**

* At step 7:

  * If validation fails:

    * System displays specific validation error messages
    * Guest must correct input
    * Resume flow at step 4

**A3: Password Too Weak**

* At step 9:

  * If password does not meet strength requirements:

    * System displays password requirements
    * Guest must enter a stronger password
    * Resume flow at step 4

**A4: Password Mismatch**

* At step 7:

  * If password and confirmation do not match:

    * System displays "Passwords do not match" message
    * Guest must re-enter passwords
    * Resume flow at step 4

**A5: Terms Not Accepted**

* At step 6 or 7:

  * If terms and conditions are not accepted:

    * System displays "You must accept terms and conditions" message
    * Resume flow at step 5

**A6: Database Save Error**

* At step 11:

  * If save operation fails:

    * System displays error message
    * Option to retry
    * End flow
