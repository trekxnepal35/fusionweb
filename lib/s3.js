import {
  S3Client,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


/*
====================================================
S3 CLIENT
====================================================
*/

const s3 = new S3Client({

  region: process.env.AWS_REGION,

  credentials: {

    accessKeyId: process.env.AWS_ACCESS_KEY_ID,

    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,

  },

});


/*
====================================================
CREATE SIGNED IMAGE URL
====================================================
*/

export async function getS3SignedUrl(
  key,
  expiresIn = 3600
) {

  if (!key) {
    return "";
  }


  const command =
    new GetObjectCommand({

      Bucket:
        process.env.AWS_S3_BUCKET_NAME,

      Key: key,

    });


  const signedUrl =
    await getSignedUrl(
      s3,
      command,
      {
        expiresIn,
      }
    );


  return signedUrl;

}


export default s3;