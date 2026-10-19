import CategoryRoute, {
  generateStaticParams as categoryParams,
} from "./(store)/shop/[category]/page";
import PolicyRoute from "./(store)/care/[policy]/page";
import ProductRoute, {
  generateMetadata as productMetadata,
  generateStaticParams as productParams,
} from "./(store)/product/[slug]/page";

const params = <T extends Record<string, string>>(value: T) => ({
  params: Promise.resolve(value),
  searchParams: Promise.resolve({}),
});

test.each([
  ["product", () => ProductRoute(params({ slug: "missing" }))],
  ["category", () => CategoryRoute(params({ category: "sets" }))],
  ["policy", () => PolicyRoute(params({ policy: "unknown" }))],
])("an unknown %s renders the not-found page", async (_, render) => {
  await expect(render()).rejects.toThrow("NEXT_NOT_FOUND");
});

test("every product and category is pre-rendered", async () => {
  expect(await productParams()).toHaveLength(59);
  expect(categoryParams()).toEqual([
    { category: "makeup" },
    { category: "skincare" },
    { category: "fragrance" },
    { category: "hair" },
  ]);
});

test("product pages get their own title and description", async () => {
  await expect(
    productMetadata(params({ slug: "the-ordinary-hyaluronic-acid-2-b5" })),
  ).resolves.toMatchObject({
    title: "Hyaluronic Acid 2% + B5",
    description: expect.stringContaining("lasting surface hydration"),
  });
});
