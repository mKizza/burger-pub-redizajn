function PageMeta({ title, description }) {
  const fullTitle = title ? `${title} | Burger Pub München` : "Burger Pub München";

  return (
    <>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
    </>
  );
}

export default PageMeta;
