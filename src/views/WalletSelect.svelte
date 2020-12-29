<script lang="ts">
  import BigNumber from 'bignumber.js'
  import { get } from 'svelte/store'
  import { fade } from 'svelte/transition'
  import { onDestroy, onMount } from 'svelte'

  import { app, resetWalletState, wallet, walletInterface } from '../stores'

  import Modal from '../components/Modal.svelte'
  import ModalHeader from '../components/ModalHeader.svelte'
  import Wallets from '../components/Wallets.svelte'
  import SelectedWallet from '../components/SelectedWallet.svelte'
  import Button from '../elements/Button.svelte'
  import IconButton from '../elements/IconButton.svelte'
  import walletIcon from '../elements/walletIcon'

  import {
    getProviderName,
    createLegacyProviderInterface,
    createModernProviderInterface,
    getAddress,
    getBalance,
    getNetwork,
    isPromise,
    networkName
  } from '../utilities'

  import {
    WalletSelectModalData,
    AppState,
    WalletModule,
    WalletSelectModule,
    WalletInterface,
    PopupContent
  } from '../interfaces'

  const defaultPopupContent: PopupContent = {
    dismiss: "Dismiss",
    teaser: "Can't find your wallet?",
    fullHtml:
      `If your wallet is not on the list yet, it is nonetheless <a href="https://zksync.io/faq/wallets.html#what-if-my-wallet-is-not-supported-or-can-t-sign-a-message" target="_blank">possible to withdrawal your funds to L1</a>.
 <span class="bn-call-to-action-line">To request a withdrawal, send your zkSync address to <a style="color: #4a90e2; font-size: 0.889rem; font-family: inherit;" class="bn-onboard-clickable" href="mailto:withdraw@zksync.io">withdraw@zksync.io.</a></span> In the future, this functionality will be automated.`,
  }

  export let module: WalletSelectModule = {
    heading: '',
    description: '',
    wallets: [],
    popupContent: defaultPopupContent
  }

  let modalData: WalletSelectModalData | null
  let showWalletDefinition: boolean
  let walletAlreadyInstalled: string | undefined
  let installMessage: string | undefined

  let selectedWalletModule: WalletModule

  const { mobileDevice, os } = get(app)
  let { heading, description, explanation, wallets, popupContent } = module

  let primaryWallets: WalletModule[]
  let secondaryWallets: WalletModule[] | undefined

  let loadingWallet: string | undefined = undefined

  let showingAllWalletModules = false
  const showAllWallets = () => (showingAllWalletModules = true)

  function lockScroll () {
    window.scrollTo(0, 0)
  }

  let originalOverflowValue: string

  onMount(() => {
    originalOverflowValue = window.document.body.style.overflow
    window.document.body.style.overflow = 'hidden'
    window.addEventListener('scroll', lockScroll)
  })

  onDestroy(() => {
    window.removeEventListener('scroll', lockScroll)
    window.document.body.style.overflow = originalOverflowValue
  })

  renderWalletSelect()

  async function renderWalletSelect () {
    const appState = get(app)
    // noinspection ES6RedundantAwait
    wallets = await wallets

    const deviceWallets = (wallets as WalletModule[]).filter(wallet => wallet[mobileDevice ? 'mobile' : 'desktop']).filter(wallet => {
      const { osExclusions = [] } = wallet
      return !osExclusions.includes(os.name)
    })

    const popupContent = defaultPopupContent;

    if (deviceWallets.find(wallet => wallet.preferred)) {
      // if preferred wallets, then split in to preferred and not preferred
      primaryWallets = deviceWallets.filter(wallet => wallet.preferred)
      secondaryWallets = deviceWallets.filter(wallet => !wallet.preferred)
    } else {
      // otherwise make the first 4 wallets preferred
      primaryWallets = deviceWallets.slice(0, 4)
      secondaryWallets =
        deviceWallets.length > 4 ? deviceWallets.slice(4) : undefined
    }

    if (appState.autoSelectWallet) {
      const module = deviceWallets.find(
        (m: WalletModule) => m.name === appState.autoSelectWallet
      )

      app.update(store => ({ ...store, autoSelectWallet: '' }))

      if (module) {
        await handleWalletSelect(module, true)
        return
      }
    }

    modalData = {
      heading,
      description,
      explanation,
      primaryWallets,
      secondaryWallets,
      popupContent
    }

    app.update(store => ({ ...store, walletSelectDisplayedUI: true }))
  }

  async function handleWalletSelect (
    module: WalletModule,
    autoSelected?: boolean
  ) {
    const currentWalletInterface = get(walletInterface)
    const { browser, os } = get(app)

    if (currentWalletInterface && currentWalletInterface.name === module.name) {
      finish({ completed: true })
      return
    }

    loadingWallet = module.name

    const {
      provider,
      interface: selectedWalletInterface,
      instance
    } = await module.wallet({
      getProviderName,
      createLegacyProviderInterface,
      createModernProviderInterface,
      BigNumber,
      getNetwork,
      getAddress,
      getBalance,
      resetWalletState,
      networkName,
      browser,
      os
    })

    loadingWallet = undefined

    // if no interface then the user does not have the wallet they selected installed or available
    if (!selectedWalletInterface) {
      selectedWalletModule = module

      walletAlreadyInstalled = provider && getProviderName(provider)

      installMessage =
        module.installMessage &&
        module.installMessage({
          currentWallet: walletAlreadyInstalled,
          selectedWallet: selectedWalletModule.name
        })

      // if it was autoSelected then we need to add modalData to show the modal
      if (autoSelected) {
        modalData = {
          heading,
          description,
          explanation,
          primaryWallets,
          secondaryWallets,
          popupContent
        }

        app.update(store => ({ ...store, walletSelectDisplayedUI: true }))
      }

      return
    }

    walletInterface.update((currentInterface: WalletInterface | null) => {
      if (currentInterface && currentInterface.disconnect) {
        currentInterface.disconnect()
      }

      return selectedWalletInterface
    })

    wallet.set({
      provider,
      instance,
      dashboard: selectedWalletInterface.dashboard,
      name: module.name,
      connect: selectedWalletInterface.connect,
      type: module.type
    })

    finish({ completed: true })
  }

  function finish (options: { completed: boolean }) {
    modalData = null
    app.update(store => ({
      ...store,
      walletSelectInProgress: false,
      walletSelectCompleted: options.completed
    }))
  }
</script>

<style>
    /* .bn-onboard-select-description, .bn-onboard-select-wallet-definition */
    p {
        font-size: 0.889em;
        margin: 1.6em 0 0 0;
        font-family: inherit;
    }

    /* .bn-onboard-select-info-container */
    div {
        display: flex;
        font-size: inherit;
        font-family: inherit;
        justify-content: space-between;
    }

    /* .bn-onboard-select-wallet-info */
    div span {
        color: #4a90e2;
        font-size: inherit;
        font-family: inherit;
        margin-top: 0.66em;
        cursor: pointer;
    }
</style>

{#if modalData}
  <Modal closeModal={() => finish({ completed: false })}>
    <ModalHeader icon={walletIcon} heading={modalData.heading} />
    {#if !selectedWalletModule}
      <p class="bn-onboard-custom bn-onboard-select-description">
        {@html modalData.description}
      </p>
      <Wallets
        {modalData}
        {handleWalletSelect}
        {loadingWallet}
        {showingAllWalletModules}
        {showAllWallets}
      />
      <div class="bn-onboard-custom bn-onboard-select-info-container">
            <span
              class="bn-onboard-custom bn-onboard-select-wallet-info"
              on:click={() => (showWalletDefinition = !showWalletDefinition)}
            >
              {modalData.popupContent.teaser}
            </span>
        {#if mobileDevice}
          <Button onclick={() => finish({ completed: false })}>{modalData.popupContent.dismiss}</Button>
        {/if}
      </div>
      {#if showWalletDefinition}
        <p
          in:fade
          class="bn-onboard-custom bn-onboard-select-wallet-definition"
        >
          {@html modalData.popupContent.fullHtml}
        </p>
      {/if}
    {:else}
      <SelectedWallet
        {selectedWalletModule}
        onBack={() => {
          selectedWalletModule = null
          walletAlreadyInstalled = null
        }}
        {installMessage}
      />
    {/if}
  </Modal>
{/if}
