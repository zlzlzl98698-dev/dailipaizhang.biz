import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme-without-fonts'
import Layout from './Layout.vue'
import './styles/custom.css'

import PagefindSearch from './components/PagefindSearch.vue'
import DiagnosticTriage from './components/DiagnosticTriage.vue'
import IssueDecisionTree from './components/IssueDecisionTree.vue'
import BrandDirectory from './components/BrandDirectory.vue'
import ClientMatrix from './components/ClientMatrix.vue'
import BrandEvidencePanel from './components/BrandEvidencePanel.vue'
import PlanComparisonTable from './components/PlanComparisonTable.vue'
import NodeSpeedTable from './components/NodeSpeedTable.vue'
import UnlockStatusMatrix from './components/UnlockStatusMatrix.vue'
import NetworkRouteDiagram from './components/NetworkRouteDiagram.vue'
import SourceBadge from './components/SourceBadge.vue'
import EvidenceNote from './components/EvidenceNote.vue'
import AffiliateCta from './components/AffiliateCta.vue'
import NotFoundPage from './components/NotFoundPage.vue'
import HomePage from './components/HomePage.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('PagefindSearch', PagefindSearch)
    app.component('DiagnosticTriage', DiagnosticTriage)
    app.component('IssueDecisionTree', IssueDecisionTree)
    app.component('BrandDirectory', BrandDirectory)
    app.component('ClientMatrix', ClientMatrix)
    app.component('BrandEvidencePanel', BrandEvidencePanel)
    app.component('PlanComparisonTable', PlanComparisonTable)
    app.component('NodeSpeedTable', NodeSpeedTable)
    app.component('UnlockStatusMatrix', UnlockStatusMatrix)
    app.component('NetworkRouteDiagram', NetworkRouteDiagram)
    app.component('SourceBadge', SourceBadge)
    app.component('EvidenceNote', EvidenceNote)
    app.component('AffiliateCta', AffiliateCta)
    app.component('NotFoundPage', NotFoundPage)
    app.component('HomePage', HomePage)
  },
} satisfies Theme
