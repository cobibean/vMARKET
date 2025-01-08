import { createThirdwebClient } from "thirdweb";

const clientId = "d4dd39d0c84df782e1bbdfef93b744b4";

if (!clientId) {
  throw new Error("No client ID provided");
}

export const client = createThirdwebClient({
  clientId: clientId,
});
