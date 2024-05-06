import { type HeadElements, Pipeline } from '../core/base-pipeline.js';
import type { RouteData, SSRElement, SSRResult } from '../@types/astro.js';
import {
	createModuleScriptElement,
	createStylesheetElementSet,
} from '../core/render/ssr-element.js';

export class TestPipeline extends Pipeline {
	static create({
		logger,
		manifest,
		mode,
		renderers,
		resolve,
		serverLike,
		streaming,
	}: Pick<
		TestPipeline,
		'logger' | 'manifest' | 'mode' | 'renderers' | 'resolve' | 'serverLike' | 'streaming'
	>) {
		return new TestPipeline(logger, manifest, mode, renderers, resolve, serverLike, streaming);
	}

	componentMetadata(_routeData: RouteData): Promise<SSRResult['componentMetadata']> | void {}

	headElements(routeData: RouteData): Promise<HeadElements> | HeadElements {
		const routeInfo = this.manifest.routes.find((route) => route.routeData === routeData);
		const links = new Set<never>();
		const scripts = new Set<SSRElement>();
		const styles = createStylesheetElementSet(routeInfo?.styles ?? []);

		for (const script of routeInfo?.scripts ?? []) {
			if ('stage' in script) {
				if (script.stage === 'head-inline') {
					scripts.add({
						props: {},
						children: script.children,
					});
				}
			} else {
				scripts.add(createModuleScriptElement(script));
			}
		}
		return { links, styles, scripts };
	}
}
