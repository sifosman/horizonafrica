# Localized "Financial Triage" Knowledge Architecture for South African Medical Bots

**Author**: Manus AI

This document outlines the specialized knowledge required for a WhatsApp bot to effectively handle the complexities of the South African medical aid landscape, specifically focusing on **Discovery Health**, **GEMS**, and **GAP Cover**.

## 1. The "Discovery Health" Logic (Network vs. Out-of-Network)

Discovery Health, South Africa's largest medical scheme, operates on a "Plan-Specific Network" model. The bot must understand that a patient's co-payment is determined by their specific plan type and the doctor's network status [1].

| Plan Type | Specialist Coverage | Bot Interaction Logic |
| :--- | :--- | :--- |
| **Executive / Comprehensive** | 200% - 300% of DHR (Discovery Health Rate). | Bot asks: "Are you on a Classic or Essential plan?" to determine if the 200% or 300% rate applies. |
| **Coastal / Saver** | 100% of DHR. | Bot warns: "Your plan covers 100% of the medical aid rate. If Dr. [Name] charges 300%, you will have a 200% shortfall." |
| **Smart / Core** | Hospital-only or specific network. | Bot checks: "Is this doctor on your Smart Network?" and warns about the R130+ co-payment for out-of-network GP visits [2]. |

## 2. The "GEMS" Logic (Public Servant Sector)

GEMS (Government Employees Medical Scheme) has unique referral rules that, if not followed, lead to total claim rejection.
*   **The Referral Rule**: For "Value" and "Emerald Value" plans, patients **must** have a referral from their nominated Network Family Practitioner (FP) before seeing a specialist [3].
*   **Bot Action**: The bot must ask GEMS patients: "Do you have a referral letter from your nominated GP?" If not, it should advise: "GEMS requires a referral for your plan type to avoid paying the full specialist fee yourself."

## 3. The "GAP Cover" Shortfall Calculation

GAP cover is the "bridge" for the massive shortfalls (up to 500% or 700% of medical aid rates) charged by specialists in South Africa [4].

### Shortfall Calculation Logic
The bot can perform a "Pre-Consultation Financial Estimate" using this formula:
`Estimated Out-of-Pocket = (Specialist Fee) - (Medical Aid Plan Rate)`

*   **Example**: 
    *   Specialist Fee: R4,500
    *   Medical Aid Rate (100%): R1,500
    *   **Shortfall**: R3,000
*   **GAP Cover Integration**: The bot asks: "Do you have GAP cover (e.g., Zestlife, Stratum)?" 
    *   If **Yes**: "Your GAP cover typically covers up to 500% of the medical aid rate. You likely won't have to pay this R3,000 out of pocket, but you will need to claim it back."
    *   If **No**: "You will likely be responsible for a R3,000 shortfall."

## 4. Aesthetic and Dental Complexities

### Aesthetic Exclusions
Most medical aids exclude "cosmetic" procedures but may cover "reconstructive" ones.
*   **Bot Logic**: For aesthetic clinics, the bot should say: "Medical aids generally do not cover Botox or fillers for cosmetic reasons. Would you like our private pricing list instead?" [5]

### Dental "Specialized" Benefits
Dental benefits are often split between "Basic" (fillings, cleaning) and "Specialized" (crowns, bridges, implants).
*   **Bot Logic**: For dental practices, the bot should ask: "Is this for a routine check-up or a specialized procedure like a crown?" and warn that specialized dentistry often requires pre-authorization and has an annual limit [6].

## 5. Bot Flow: The "Financial Triage" Sequence

1.  **Identity Capture**: "Which medical aid and plan are you on?"
2.  **Network Check**: (Internal) Is the doctor a network provider for this plan?
3.  **Referral Check**: (For GEMS/Smart plans) "Do you have a referral?"
4.  **Pricing Disclosure**: "Dr. [Name] charges R[Amount]. Your plan typically covers R[Amount]."
5.  **GAP Cover Prompt**: "Do you have GAP cover to handle the R[Shortfall] difference?"
6.  **POPIA Consent**: "Do you consent to us sharing this estimate with your medical aid for pre-auth?"

## Conclusion

By embedding this "Financial Triage" logic, your bot stops being a generic WhatsApp tool and becomes an indispensable financial advisor for the patient and a debt-reduction tool for the practice. This local expertise is the primary competitive advantage against global players like Wazzy.

## References
[1] Your 2026 benefits and contributions. *Discovery Health*. Available at: [https://www.discovery.co.za/medical-aid/product-benefit-enhancements](https://www.discovery.co.za/medical-aid/product-benefit-enhancements)
[2] Smart Plan Guide 2026. *Discovery Health*. Available at: [https://www.discovery.co.za/wcm/discoverycoza/assets/faz/medical-aid/2026/health-plan-guides/discovery-health-medical-scheme-smart-plan-guide.pdf](https://www.discovery.co.za/wcm/discoverycoza/assets/faz/medical-aid/2026/health-plan-guides/discovery-health-medical-scheme-smart-plan-guide.pdf)
[3] Family Practitioner Guide 2026. *GEMS*. Available at: [https://www.gems.gov.za/-/media/Project/Documents/Provider-Guides/2026/MedYEP-2504-GEMS-FP-Guide-for-2026.pdf](https://www.gems.gov.za/-/media/Project/Documents/Provider-Guides/2026/MedYEP-2504-GEMS-FP-Guide-for-2026.pdf)
[4] Gap Cover in South Africa Explained. *Hippo.co.za*. Available at: [https://www.hippo.co.za/blog/health/gap-cover-south-africa-explained/](https://www.hippo.co.za/blog/health/gap-cover-south-africa-explained/)
[5] Discovery Health aesthetic exclusions and co-payments 2026. *Discovery Health*. (Internal Policy Review).
[6] Dental and Oral Benefit 2026. *Remedi/Discovery*. Available at: [https://www.yourremedi.co.za/wcm/medical-schemes/remedi/assets/benefit-guides/2026/remedi-dental-and-oral-benefit.pdf](https://www.yourremedi.co.za/wcm/medical-schemes/remedi/assets/benefit-guides/2026/remedi-dental-and-oral-benefit.pdf)
