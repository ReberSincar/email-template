import {
  SESClient,
  CreateTemplateCommand,
  DeleteTemplateCommand,
} from "@aws-sdk/client-ses";
import env from "../config/env";

const sesClient = new SESClient({
  region: env.aws.ses.region,
  credentials: {
    accessKeyId: env.aws.credentials.aws_access_key_id,
    secretAccessKey: env.aws.credentials.aws_secret_access_key,
  },
});

const createTemplate = async ({
  templateName,
  htmlPart,
  subjectPart,
  textPart,
}) => {
  try {
    const params = {
      Template: {
        TemplateName: templateName,
        HtmlPart: htmlPart,
        SubjectPart: subjectPart,
        TextPart: textPart,
      },
    };
    const data = await sesClient.send(new CreateTemplateCommand(params));
    console.log("Success", data);
    return data;
  } catch (err) {
    console.log("Error", err.stack);
  }
};

const deleteTemplate = async ({ templateName }) => {
  try {
    const data = await sesClient.send(
      new DeleteTemplateCommand({ TemplateName: templateName })
    );
    console.log("Success", data);
    return data;
  } catch (err) {
    console.log("Error", err.stack);
  }
};

export default { createTemplate, deleteTemplate };
