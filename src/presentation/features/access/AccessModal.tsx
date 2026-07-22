/**
 * Back-compat shim — request-access waitlist was replaced by public beta signup.
 * Import from `./SignUpModal` in new code.
 */
export {
  SignUpModalProvider,
  SignUpModalProvider as AccessModalProvider,
  useSignUpModal,
  useAccessModal,
} from "./SignUpModal";
