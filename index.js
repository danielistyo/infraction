import linkify from "./linkify.js";
import { getUserByName, getUserInfractions } from "./user-api.js";

/**
 * get infraction by username
 * @param {string} username
 * @returns {Promise} Promise of infraction array
 */
function getInfractionByUsername(username) {
  return new Promise((resolve) => {
    getUserByName(username, (user) => {
      getUserInfractions(user.id, (result) => {
        resolve(result);
      });
    });
  });
}

/**
 * Returns reason of the worst or the most recent user infraction with linkified urls
 * @param {'worst' | 'mostRecent'} type
 * @param {string} username
 * @returns {Promise.<Object>}
 */
async function getReasonOfInfractionLinkifiedFor(type, username) {
  try {
    const result = await getInfractionByUsername(username);

    // worst uses points property
    // mostRecent uses id property
    const propertyName = type === "worst" ? "points" : "id";
    // find most recent infraction
    const infraction = result.reduce((targetInfraction, curInfraction) => {
      return curInfraction[propertyName] > targetInfraction[propertyName]
        ? curInfraction
        : targetInfraction;
    }, result[0]);

    // replace urls by links
    return linkify(infraction.reason);
  } catch (error) {
    return null;
  }
}

/**
 * Returns reason of the worst & the most recent user infraction with linkified urls
 * @param {string} username
 * @returns {Promise.<Object>}
 */
export async function getRelevantInfractionReasons(username) {
  const worst = await getReasonOfInfractionLinkifiedFor("worst", username);
  const mostRecent = await getReasonOfInfractionLinkifiedFor("mostReason", username);
  return { mostRecent, worst };
}
