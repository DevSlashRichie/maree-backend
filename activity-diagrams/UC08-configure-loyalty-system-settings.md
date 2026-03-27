Use Case No. 08
Number: UC08
Name: Configure the Loyalty System Settings
Description: The administrator can configure the loyalty system parameters, including point earning rules, redemption rates, tier thresholds, and reward definitions.
Actor(s): Administrator
Preconditions:
The user must be logged into the system. The system must be operational.
Postconditions:
The loyalty system settings are updated and applied to all future loyalty transactions.
Special Requirements: None
Extension Points: None

### **Flow: Configure the Loyalty System Settings**

1. **Start**
2. Administrator navigates to loyalty settings panel
3. System validates authentication token and administrator role
4. System retrieves current loyalty system configuration
5. System displays configuration interface with current settings
6. Administrator modifies settings:

   * Point earning rules
   * Redemption rates
   * Tier thresholds
   * Reward definitions
7. System validates each configuration change
8. System displays updated configuration summary
9. Administrator confirms changes
10. System saves new configuration to database
11. System logs changes in audit trail
12. System displays confirmation message
13. **End**

---

### **Optional Alternative**

**A1: Unauthorized Access**

* At step 3:

  * If user is not an administrator:

    * System displays "Access denied" message
    * System redirects to home page
    * End flow

**A2: Invalid Configuration Values**

* At step 7:

  * If configuration values are invalid:

    * System displays validation error messages
    * Administrator must correct values
    * Resume flow at step 6

**A3: Database Save Error**

* At step 10:

  * If save operation fails:

    * System displays error message
    * Option to retry
    * End flow

**A4: Cancel Changes**

* At step 9:

  * If administrator cancels:

    * System discards unsaved changes
    * System displays original configuration
    * End flow
