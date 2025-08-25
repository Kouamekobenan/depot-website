// renderer/pages/_error.tsx
import React from "react";
import { NextPage, NextPageContext } from "next";
import { NextApiResponse } from "next";

interface ErrorProps {
  statusCode: number;
  hasGetInitialPropsRun?: boolean;
  err?: Error;
}

interface CustomNextPageContext extends NextPageContext {
  res?: NextApiResponse;
  err?: Error & { statusCode?: number };
}

const ErrorPage: NextPage<ErrorProps> = ({ statusCode }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <h1>
        {statusCode
          ? `Une erreur ${statusCode} s'est produite sur le serveur`
          : "Une erreur s'est produite côté client"}
      </h1>
      <p>Veuillez réessayer plus tard.</p>
    </div>
  );
};

ErrorPage.getInitialProps = ({
  res,
  err,
}: CustomNextPageContext): ErrorProps => {
  const statusCode: number = res?.statusCode || err?.statusCode || 404;
  return { statusCode };
};

export default ErrorPage;
