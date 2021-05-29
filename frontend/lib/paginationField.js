import { PAGINATION_QUERY } from '../components/Pagination';

export default function paginationField() {
  return {
    keyArgs: false, // tells apollo we will take care of everything
    read(existing = [], { args, cache }) {
      //   console.log({ existing, args, cache });
      const { skip, first } = args;
      // read the number of items on the page from the cache
      const data = cache.readQuery({ query: PAGINATION_QUERY });
      //   console.log(data);
      const count = data?._allProductsMeta?.count;
      const page = skip / first + 1;
      const pages = Math.ceil(count / first);

      // check if we have existing items
      const items = existing.slice(skip, skip + first).filter((x) => x);
      // if
      // there are items
      // and there aren't enough items to fill the page (satisfy how many were requested)
      // AND we are on the last page
      // THEN just send it
      if (items.length && items.length !== first && page === pages) {
        return items;
      }
      if (items.length !== first) {
        // we don't have any items, we must go to the netowrk to fetch them
        return false;
      }

      // if there are items, just return them from the cahce, and we don't need to go to the network
      if (items.length) {
        // console.log(
        //   `There are ${items.length} items in the cahce! Gonna sent them to appollo`
        // );
        return items;
      }

      return false; // falback to network
      // first thing is asks the read function for those items
      // we can either do one of two things:
      // first thing is return the items because they are already in the cache
      // second is to return false from here, (which will make a network request)
    },
    merge(existing, incoming, { args }) {
      const { skip, first } = args;
      // this runs when the Apollo client comes back from the network with our products
      // how do you want to put them in the cache, what order, where, etc
      //   console.log(`Merging items from the network ${incoming.length}`);
      const merged = existing ? existing.slice(0) : [];
      for (let i = skip; i < skip + incoming.length; ++i) {
        merged[i] = incoming[i - skip];
      }
      //   console.log(merged);
      // finally we return the mergeed items from the cache
      return merged;
    },
  };
}
