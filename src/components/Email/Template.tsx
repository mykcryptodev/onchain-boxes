import { type FC } from "react";

import { MARKETPLACE_NAME } from "~/constants";

interface EmailTemplateProps {
  text: string;
}

const EmailTemplate: FC<Readonly<EmailTemplateProps>> = ({
  text,
}) => (
  <div className="w-full flex justify-center">
    <div className="container">
      <h1>{MARKETPLACE_NAME}</h1>
      <p>{text}</p>
    </div>
  </div>
);

export default EmailTemplate;
