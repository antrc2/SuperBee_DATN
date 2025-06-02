import { HeadProvider, Title, Link, Meta } from "react-head";

const PageMeta = ({ title, description }) => (
  <HeadProvider>
    <Title>{title}</Title>
    <Meta name="description" content={description} />
  </HeadProvider>
);

export default PageMeta;
