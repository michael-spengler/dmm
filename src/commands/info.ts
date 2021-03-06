import { colours } from "../../deps.ts";
import DenoService from "../services/deno_service.ts";

/**
 * Supplies information on the given module in the first
 * index of `modules`
 *
 * @param modules - List of modules to get info on. Currently, we only support 1, so `modules[0]` will be used
 */
export async function info(modules: string[]): Promise<void> {
  if (modules.length === 0 || modules.length > 1) {
    console.error(
      colours.red(
        "Specify a single module to get information on. See --help",
      ),
    );
    Deno.exit(1);
  }
  const moduleToGetInfoOn = modules[0];
  const stdResponse = await fetch(
    "https://github.com/denoland/deno/tree/master/std/" + moduleToGetInfoOn,
  );
  const thirdPartyResponse = await fetch(
    DenoService.DENO_CDN_URL + moduleToGetInfoOn + "/meta/versions.json",
  ); // Only used so we can check if the module exists
  const isStd = stdResponse.status === 200;
  const isThirdParty = thirdPartyResponse.status === 200;
  if (!isStd && !isThirdParty) {
    console.error(
      colours.red("No module was found with " + moduleToGetInfoOn),
    );
    Deno.exit(1);
  }
  const name = moduleToGetInfoOn;
  let description;
  let denoLandUrl;
  let gitHubUrl;
  let latestVersion;
  if (isStd) {
    latestVersion = DenoService.getLatestStdRelease();
    description = "Cannot retrieve descriptions for std modules";
    denoLandUrl = "https://deno.land/std@" + latestVersion + "/" +
      name;
    gitHubUrl = "https://github.com/denoland/deno/tree/master/std/" + name;
  }
  if (isThirdParty) {
    description = await DenoService.getThirdPartyDescription(name);
    gitHubUrl = "https://github.com/" +
      await DenoService.getThirdPartyRepoAndOwner(name);
    latestVersion = await DenoService.getLatestThirdPartyRelease(name);
    denoLandUrl = "https://deno.land/x/" + name + "@" + latestVersion;
  }
  const importLine = "import * as " + name + ' from "' + denoLandUrl + '";';
  console.info(
    "\n" +
      `Information on ${name}\n\n  - Name: ${name}\n  - Description: ${description}\n  - deno.land Link: ${denoLandUrl}\n  - GitHub Repository: ${gitHubUrl}\n  - Import Statement: ${importLine}\n  - Latest Version: ${latestVersion}` +
      "\n",
  );
  Deno.exit();
}
