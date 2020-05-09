import {ThemedComponentThis} from '@connectv/jss-theme';  // @see [CONNECTIVE JSS Theme](https://github.com/CONNECT-platform/connective-jss-theme)
import {RendererLike} from '@connectv/html';              // @see [CONNECTIVE HTML](https://github.com/CONNECT-platform/connective-html)
import {GithubButton} from '@codedoc/core/components';                        // @see tab:style.ts

export interface GithubConfig {                              // --> a nice interface for possible props
    repo: string;                                            // --> which is the raise level of our cards. Note that all props MUST be of type `string`
    user: string;                                            // --> which is the raise level of our cards. Note that all props MUST be of type `string`
}

export function GithubBtn(this: ThemedComponentThis,                                // --> keep typescript strict typing happy
                          options: GithubConfig,                                     // --> the component props (attributes)
                          renderer: RendererLike<any, any>,                         // --> our beloved renderer
                          content: any,) {
    return (<GithubButton action='Star'
                          repo={options.repo}
                          user={options.user}
                          large='true'
                          count='true'
                          standardIcon='false'/>
    )
}