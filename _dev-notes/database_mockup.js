console.log("\nDatabase mockup file loaded.");
console.log("##################################\n");

function Category( name, uuid ) {
  this.name = name;
  this.uuid = uuid;
}

let uuidMap = {}; // { clientUuid: serverUuid }

let server = {}
let client = {}

let serCatArr = []
let cliCatArr = []

serCatArr[0] = new Category( "fruits", "ab67");
serCatArr[1] = new Category( "frais", "cd84");
serCatArr[2] = new Category( "dph", "ef93");

cliCatArr[0] = new Category( "fruits", "ab67");
cliCatArr[1] = new Category( "frais", "cp84");
cliCatArr[2] = new Category( "boucherie", "gh73");

server.categories = serCatArr;
client.categories = cliCatArr;

function syncUp ( clientCatArray, serverCatArray ) {
  console.log("SYNC UP");
  for ( let category of clientCatArray ) {
    if (checkUUID(category, serverCatArray)) {
      console.log(`Matching UUID for ${category.name}!`);
      continue;
    } else {
      if (checkName(category, serverCatArray)) {
        console.log(`Matching name for ${category.name}!`);
        console.log("Adding key/value to uuidMap.");
        let serverCategory = serverCatArray.find(s => s.name === category.name);
        uuidMap[category.uuid] = serverCategory.uuid
      } else {
        console.log("No corresponding UUID/name -> time to insert !");
        serverCatArray.push(category);
      }
    }
  }
}

function syncDown ( clientCatArray, serverCatArray, uuidMap ) {
  console.log("SYNC DOWN");
  for( let category of serverCatArray) {
    if (checkUUID(category, clientCatArray)) {
      console.log(`Matching UUID for ${category.name}!`);
      continue;
    } else {
      if (checkName(category, clientCatArray)) {
        console.log(`Matching name for ${category.name}!`);
        console.log("Updating UUID from uuidMap.");
        let clientCategory = clientCatArray.find(s => s.name === category.name);
        clientCategory.uuid = category.uuid;
      } else {
        console.log("No corresponding UUID/name -> time to insert !");
        clientCatArray.push(category);
      }
    }
  }
}

const checkUUID = ( cliCategory, serCategoryArray ) => {
  for ( let serCategory of serCategoryArray ) {
    if (serCategory.uuid === cliCategory.uuid) {
      return true;
    }
  }
  return false;
}

const checkName = ( cliCategory, serCategoryArray) => {
  for ( let serCategory of serCategoryArray ) {
    if (serCategory.name === cliCategory.name) {
      return true;
    }
  }
  return false;
}

syncUp(client.categories, server.categories);



assertEverything(server, client, uuidMap);


syncDown(client.categories, server.categories, uuidMap);

assertEverything(server, client, uuidMap);

function assertEverything(server, client, uuidMap) {
  console.log("\nAsserting Everything");
  console.log("#######################\n");

  console.log("SERVER:");
  for( let category of server.categories) {
    console.log(`${category.name} / ${category.uuid}`);
  }

  console.log("CLIENT:");
  for( let category of client.categories) {
    console.log(`${category.name} / ${category.uuid}`);
  }

  console.log("UUIDMAP:");
  for ( let cliUuid in uuidMap) {
    console.log(`Client ${cliUuid} / Server ${uuidMap[cliUuid]}`);
  }

  console.log("#######################\n");
}


////////////////////////  STEPS TO SYNCHRONIZATION  ////////////////////////////
//
// C01- Collecting every "dirty" categories
// C02- Pack categories UUID and name in JSON
// C03- Send JSON through http
// S04- receive JSON and parse data
// S05- for every UUID, check if UUID in db.
// S05a- if UUID in db : do nothing (shouldn't be, but well...)
// S05b- if UUID NOT in db : check if name in db.
// S05bi- if name NOT in db : INSERT category name and UUID into db.
// S05bii- if name in db : UUIDMap[clientUUID] = serverUUID
// S06- Collect every categories
// S07- Pack categories UUIDs and names in JSON
// S08- Send categories JSON and UUIDMap through http
// C10- receive response and parse data
// C11- for every UUIDMap[clientUUID] key check if UUID in db
// C11a- if clientUUID in db : replace with serverUUID value.
// C11b- if clientUUID NOT in db : do nothing.
// C12- INSERT IGNORE category name and UUID into db.
//
// C13- Collecting every "dirty" groceries (UNION with categories to fetch UUIDs)
// C14- Pack groceries UUID, name and category_UUID in JSON.
// C15- Send JSON through http
// S16- receive JSON and parse data
// S17- for every UUID, check if UUID in db.
// S17a- if UUID in db : do nothing (shouldn't be such a case but whatever...)
// S17b- if UUID NOT in db : check if name AND category_uuid (!) in db.
// S17bi- if name AND category_uuid NOT in db : INSERT grocery and UUID into db.
// S17bii- if name AND category_uuid in db : UUIDMap[clientUUID] = serverUUID
// S18- Collect every groceries
// S19- Pack groceries UUID, name and category_UUID in JSON
// S20- Send groceries JSON and UUIDMap through http
// C21- Receive response and parse data
// C22- for every UUIDMap[clientUUID] key check if UUID in db
// C22a- if clientUUID in db : replace with serverUUId value.
// C22b- if clientUUID NOT in db : do nothing.
// C23- for every grocery, fetch grocery.local_category_id from grocery.category_uuid
// C24- INSERT IGNORE grocery name, UUID and local_category_id into db.
//
//
