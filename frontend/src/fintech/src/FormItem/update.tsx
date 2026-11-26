import FormItem from './index';

export default ({ children, ...props }: any) => {
  return (
    <FormItem noStyle shouldUpdate {...props}>
      {(form: any) => {
        const obj = form.getFieldsValue(true);

        return children(obj);
      }}
    </FormItem>
  );
};
