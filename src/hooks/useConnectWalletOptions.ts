import { type ConnectWalletProps } from "@thirdweb-dev/react/dist/declarations/src/wallet/ConnectWallet/ConnectWallet";

import { MARKETPLACE_NAME } from "~/constants";
import useIsDarkTheme from "~/hooks/useIsDarkTheme";

const useConnectWalletOptions = () => {
  const isDarkTheme = useIsDarkTheme();

  return {
    auth: {
      loginOptional: true,
    },
    btnTitle: "Login",
    className: "thirdweb-btn-primary",
    modalTitle: `Login to ${MARKETPLACE_NAME}`,
    modalSize: "wide",
    modalTitleIconUrl: "/images/logo-alt.png",
    welcomeScreen: {
      title: `Login to ${MARKETPLACE_NAME}`,
      subtitle:
        "Connect with your favorite provider",
      img: {
        src: "/images/logo.png",
        width: 150,
        height: 150,
      },
    },
    theme: isDarkTheme ? "dark" : "light",
  } as ConnectWalletProps;
};

export default useConnectWalletOptions;