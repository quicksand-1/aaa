import parseNestedJSON from '../utils/parseNestedJSON';

export default ({ data, ...rest }: any) => {
  try {
    let jsonString = data;
    if (typeof data === 'string') {
      jsonString = parseNestedJSON(data);
    }

    jsonString = JSON.stringify(jsonString, null, 2);

    return <pre {...rest}>{jsonString}</pre>;
  } catch (e) {
    return data;
  }
};
