import * as _ from 'lodash';
import type { ProxySetting } from 'mockttp';

import {
    serverVersion,
    versionSatisfies,
    DETAILED_CONFIG_RANGE,
    INTERCEPTOR_METADATA,
    DETAILED_METADATA,
    PROXY_CONFIG_RANGE,
    DNS_AND_RULE_PARAM_CONFIG_RANGE
} from './service-versions';

import {
    ServerConfig,
    NetworkInterfaces,
    ServerInterceptor,
    ApiError
} from './server-api-types';

import { getServerApiUrl } from '../config/server-config';

interface GraphQLError {
    locations: Array<{ line: number, column: number }>;
    message: string;
    path: Array<string>
}

export class GraphQLApiClient {

    constructor(
        private authToken?: string
    ) {}

    async graphql<T extends {}>(operationName: string, query: string, variables: unknown) {
        const response = await fetch(getServerApiUrl(), {
            method: 'POST',
            headers: {
                ...(this.authToken ? {
                    'Authorization': `Bearer ${this.authToken}`,
                } : {}),
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                operationName,
                query,
                variables
            })
        }).catch((e) => {
            throw new ApiError(`fetch failed with '${e.message ?? e}'`, operationName);
        });

        if (!response.ok) {
            throw new ApiError(`Server responded with ${response.status}`, operationName);
        }

        const result = await response.json();

        if (result.errors && result.errors.length) {
            throw new ApiError(
                result.errors.map((e: GraphQLError) => e.message).join('\n'),
                operationName
            );
        }

        return result.data as T;
    }

    async getConfig(): Promise<ServerConfig> {
        const response = await this.graphql<{
            config: ServerConfig
        }>('getConfig', `
            query getConfig {
                config {
                    certificatePath
                    httpVersion
                    httpsVersion
                    timeout
                    generateMkCert
                    cors
                    corsSafeMode
                    allowPartialTrust
                    recordTraffic
                    recordHeaders
                    recordBody
                    injectBody
                    decodePartialBody
                    useRemoteDns
                    failOnDnsError
                    isSettingDefaultProxy
                    defaultHttpProxy
                    defaultHttpsProxy
                    defaultNoProxy
                    dnsServers
                    ruleParameterKeys
                }
            }
        `, {});

        return response.config;
    }

    async getNetworkInterfaces(): Promise<NetworkInterfaces> {
        if (!versionSatisfies(await serverVersion, DETAILED_CONFIG_RANGE)) return {};

        const response = await this.graphql<{
            networkInterfaces: NetworkInterfaces
        }>('getNetworkInterfaces', `
            query getNetworkInterfaces {
                networkInterfaces {
                    name
                    address
                    netmask
                    family
                    internal
                }
            }
        `, {});

        return response.networkInterfaces;
    }

    async getInterceptors(proxyPort: number): Promise<ServerInterceptor[]> {
        const response = await this.graphql<{
            interceptors: ServerInterceptor[]
        }>('getInterceptors', `
            query getInterceptors($proxyPort: Int!) {
                interceptors(proxyPort: $proxyPort) {
                    id
                    version
                    isActivable
                    category
                    name
                    summary
                    manufacturer
                    product
                    version
                    binaryPath
                    isActive
                    isActivable

                    ${versionSatisfies(await serverVersion, INTERCEPTOR_METADATA)
                        ? 'metadata'
                        : ''
                    }
                }
            }
        `, { proxyPort });

        return response.interceptors;
    }

    async getDetailedInterceptorMetadata<M extends unknown>(id: string, subId?: string): Promise<M | undefined> {
        if (!versionSatisfies(await serverVersion, DETAILED_METADATA)) return undefined;

        if (subId) {
            throw new Error('Metadata subqueries cannot be used with GraphQL API client');
        }

        const response = await this.graphql<{
            interceptorMetadata: M
        }>('getInterceptorMetadata', `
            query getInterceptorMetadata($id: ID!) {
                interceptorMetadata(id: $id)
            }
        `, { id });

        return response.interceptorMetadata;
    }

    async setProxySetting(proxySetting: ProxySetting): Promise<void> {
        const query = `
            mutation setProxySetting($proxySetting: ProxySettingInput!) {
                setProxySetting(proxySetting: $proxySetting) {
                    ${versionSatisfies(await serverVersion, PROXY_CONFIG_RANGE)
                        ? 'proxyUrl'
                        : ''
                    }
                }
            }
        `;

        await this.graphql('setProxySetting', query, { proxySetting });
    }

    async setDnsServers(dnsServers: string[]): Promise<void> {
        if (!versionSatisfies(await serverVersion, DNS_AND_RULE_PARAM_CONFIG_RANGE)) return;

        const query = `
            mutation setDnsServers($dnsServers: [String!]!) {
                setDnsServers(dnsServers: $dnsServers)
            }
        `;

        await this.graphql('setDnsServers', query, { dnsServers });
    }

    async setRuleParameterKeys(ruleParameterKeys: string[]): Promise<void> {
        if (!versionSatisfies(await serverVersion, DNS_AND_RULE_PARAM_CONFIG_RANGE)) return;

        const query = `
            mutation setRuleParameterKeys($ruleParameterKeys: [String!]!) {
                setRuleParameterKeys(ruleParameterKeys: $ruleParameterKeys)
            }
        `;

        await this.graphql('setRuleParameterKeys', query, { ruleParameterKeys });
    }

    async triggerUpdate(): Promise<void> {
        await this.graphql('triggerUpdate', `
            mutation triggerUpdate {
                triggerUpdate
            }
        `, {});
    }

    async triggerShutdown(): Promise<void> {
        await this.graphql('triggerShutdown', `
            mutation triggerShutdown {
                triggerShutdown
            }
        `, {});
    }

    async getServerVersion(): Promise<string> {
        return await serverVersion;
    }

    async activateInterceptor(id: string, proxyPort: number, options?: any): Promise<any> {
        const response = await this.graphql<{
            activateInterceptor: any
        }>('activateInterceptor', `
            mutation activateInterceptor($id: ID!, $proxyPort: Int!, $options: JSON) {
                activateInterceptor(id: $id, proxyPort: $proxyPort, options: $options) {
                    success
                    metadata
                }
            }
        `, { id, proxyPort, options });

        return response.activateInterceptor;
    }

    async triggerServerUpdate(): Promise<void> {
        return this.triggerUpdate();
    }
}
