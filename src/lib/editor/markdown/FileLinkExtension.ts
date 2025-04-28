import { visit } from 'unist-util-visit';

import { type Root } from 'hast';

const fileLinkExtension = (resolver: (v: string) => string): ((tree: Root) => Root) => {
	return (tree) => {
		visit(tree, 'link', function (node: any, index, parent) {
			const url = node.url as string;

			if (!url.startsWith('doc:/')) return node;
			node.url = resolver(url.substring('doc:/'.length - 1));
			return node;
		});

		return tree;
	};
};

export default fileLinkExtension;
