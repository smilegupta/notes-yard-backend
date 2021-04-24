const getInputParams = event => {
    const {
      queryStringParameters: queryParams,
      body: requestBody,
      pathParameters: pathParams,
      resource,
      httpMethod,
      requestContext: context
    } = event;
    if (context) console.log("Authorizer Values", context);
    return {
      queryParams,
      body: requestBody ? JSON.parse(requestBody) : null,
      pathParams,
      resource,
      httpMethod,
      context
    };
  };
  
  module.exports = { getInputParams };

  