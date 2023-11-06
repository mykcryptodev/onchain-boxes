export const oracleSource = ({eventId} : {eventId: string}) => `
// Arguments can be provided when a request is initated on-chain and used in the request source code as shown below
const eventId = args[0];

// make HTTP request
const url = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary';

// construct the HTTP Request object. See: https://github.com/smartcontractkit/functions-hardhat-starter-kit#javascript-code
// params used for URL query parameters
// Example of query: https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=401547464
const sportsApiRequest = Functions.makeHttpRequest({
  url: url + '?event=' + ${eventId},
  headers: {
    "Content-Type": "application/json",
  },
});

// Execute the API request (Promise)
const sportsApiResponse = await sportsApiRequest;
if (sportsApiResponse.error) {
  console.error(JSON.stringify(sportsApiResponse));
  console.error(sportsApiResponse.error);
  throw Error("Request failed");
}

const data = sportsApiResponse["data"];
if (data.Response === "Error") {
  console.error(data.Message);
  throw Error('Functional error. Read message: ' + data.Message);
}

// extract the teams
const teams = data["header"]["competitions"][0]["competitors"];
const homeTeam = teams.find(team => team.homeAway === "home");
const awayTeam = teams.find(team => team.homeAway === "away");
if (!homeTeam || !awayTeam) {
  throw Error("Unable to find home or away team");
}
// game data
const qComplete = data["header"]["competitions"][0]["status"]["type"]["completed"] 
  ? 100 
  : data["header"]["competitions"][0]["status"]["period"] - 1;

// home team scores
const homeTeamScores = homeTeam["linescores"];
const homeQ1 = qComplete < 1 ? 0 : parseInt(homeTeamScores[0]?.["displayValue"] || 0);
const homeQ2 = qComplete < 2 ? 0 :  parseInt(homeTeamScores[1]?.["displayValue"] || 0);
const homeQ3 = qComplete < 3 ? 0 : parseInt(homeTeamScores[2]?.["displayValue"] || 0);
const homeF = qComplete < 100 ? 0 : parseInt(homeTeam["score"]?.slice(-1) || 0);
const homeQ1LastDigit = qComplete < 1 ? 0 : parseInt(homeQ1.toString().slice(-1));
const homeQ2LastDigit = qComplete < 2 ? 0 : parseInt((homeQ1 + homeQ2).toString().slice(-1));
const homeQ3LastDigit = qComplete < 3 ? 0 : parseInt((homeQ1 + homeQ2 + homeQ3).toString().slice(-1));
const homeFLastDigit = parseInt(homeF);
// away team scores
const awayTeamScores = awayTeam["linescores"];
const awayQ1 = qComplete < 1 ? 0 : parseInt(awayTeamScores[0]?.["displayValue"] || 0);
const awayQ2 = qComplete < 2 ? 0 : parseInt(awayTeamScores[1]?.["displayValue"] || 0);
const awayQ3 = qComplete < 3 ? 0 : parseInt(awayTeamScores[2]?.["displayValue"] || 0);
const awayF = qComplete < 100 ? 0 : parseInt(awayTeam["score"]?.slice(-1) || 0);
const awayQ1LastDigit = qComplete < 1 ? 0 : parseInt(awayQ1.toString().slice(-1));
const awayQ2LastDigit = qComplete < 2 ? 0 : parseInt((awayQ1 + awayQ2).toString().slice(-1));
const awayQ3LastDigit = qComplete < 3 ? 0 : parseInt((awayQ1+ awayQ2 + awayQ3).toString().slice(-1));
const awayFLastDigit = parseInt(awayF);

function numberToUint256(num) {
  const hex = BigInt(num).toString(16); // Convert to hex string
  return hex.padStart(64, '0'); // Pad to 32 bytes (64 hex characters)
}

function packDigits(...digits) {
  return digits.reduce((acc, val) => acc * 10 + val, 0);
}

const digits = packDigits(homeQ1LastDigit, homeQ2LastDigit, homeQ3LastDigit, homeFLastDigit, awayQ1LastDigit, awayQ2LastDigit, awayQ3LastDigit, awayFLastDigit);
const packedResult = [
  digits,         // uint8 when unpacked
  qComplete,      // uint8 when unpacked
];
const encodedResult = '0x' + packedResult.map(numberToUint256).join(''); // Using the previous numberToUint256 function
function hexToUint8Array(hexString) {
  if (hexString.startsWith('0x')) {
      hexString = hexString.slice(2);
  }
  const byteArray = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < byteArray.length; i++) {
      byteArray[i] = parseInt(hexString.substr(i * 2, 2), 16);
  }
  return byteArray;
}
const uint8ArrayResult = hexToUint8Array(encodedResult);
return uint8ArrayResult;
`