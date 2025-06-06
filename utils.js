export const categorizeEmail = (email) => {
  const personalDomains = ["gmail.com", "yahoo.com", "outlook.com"];
  const domain = email.split("@")[1];
  return personalDomains.includes(domain) ? "personal" : "work";
};
