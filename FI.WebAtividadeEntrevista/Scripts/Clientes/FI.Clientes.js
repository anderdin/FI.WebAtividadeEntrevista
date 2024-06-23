
$(document).ready(function () {
    $('#CPF').mask('000.000.000-00');
    $('#CpfBeneficiario').mask('000.000.000-00');



    $('#formCadastro').submit(function (e) {
        e.preventDefault();

        var Beneficiarios = [];
        $(this).find("#ListaBeneficiarios tbody tr").each(function () {
            var codigo = 0;
            var codigoRecolhido = $(this).attr("codigo");
            if (!codigoRecolhido.substring(0, 4) == "Temp") {
                codigo = codigoRecolhido;
            }

            var Beneficiario = {
                Id: codigo,
                Cpf: $(this).children()[0].innerText,
                Nome: $(this).children()[1].innerText
            }

            Beneficiarios.push(Beneficiario)
        });

        $.ajax({
            url: urlPost,
            method: "POST",
            data: {
                "NOME": $(this).find("#Nome").val(),
                "CEP": $(this).find("#CEP").val(),
                "Email": $(this).find("#Email").val(),
                "Sobrenome": $(this).find("#Sobrenome").val(),
                "Nacionalidade": $(this).find("#Nacionalidade").val(),
                "Estado": $(this).find("#Estado").val(),
                "Cidade": $(this).find("#Cidade").val(),
                "Logradouro": $(this).find("#Logradouro").val(),
                "Telefone": $(this).find("#Telefone").val(),
                "CPF": $(this).find("#CPF").val(),
                "Beneficiarios": Beneficiarios
            },
            error:
            function (r) {
                if (r.status == 400)
                    ModalDialog("Ocorreu um erro", r.responseJSON);
                else if (r.status == 500)
                    ModalDialog("Ocorreu um erro", "Ocorreu um erro interno no servidor.");
            },
            success:
            function (r) {
                ModalDialog("Sucesso!", r)
                $("#formCadastro")[0].reset();
            }
        });
    })

    $('#AbrirBeneficiarios').click(function () {
        $('#ModalBeneficiarios').modal('show');
    });

    $('#IncluirAlterarBeneficiario').click(function () {
        var NomeBeneficiario = $('#NomeBeneficiario').val();
        var CpfBeneficiario = $('#CpfBeneficiario').val();
        var Codigo = $('#Codigo').val();
        var Operacao = $('#IncluirAlterarBeneficiario').html();

        if (!NomeBeneficiario || !CpfBeneficiario) {
            ModalDialog('Erro de dados', 'Nome e CPF do beneficiario devem ser preenchidos.');
            return;
        }
        else {
            if (VerificarCpfExistente(CpfBeneficiario) && Operacao == "Incluir") {
                ModalDialog('Erro', 'Cpf do beneficiario já consta na lista para este cliente');
                return;
            } else {
                if (!ValidarCpfBeneficiario(CpfBeneficiario)) {
                    ModalDialog('Erro', 'Este CPF é invalido');
                    return;
                }

                if (Operacao == "Incluir")
                    AdicionarBeneficiarioLista(CpfBeneficiario, NomeBeneficiario);

                if (Operacao == "Alterar") {
                    AlterarBeneficiarioLista(Codigo, CpfBeneficiario, NomeBeneficiario);
                }
            }
        }
    });

    $('#CancelarAlterarBeneficiario').click(function() {
        $('#NomeBeneficiario').val("");
        $('#CpfBeneficiario').val("");
        $('#Codigo').val("0");

        $('#IncluirAlterarBeneficiario').html("Incluir");
        $('#CancelarAlterarBeneficiario').addClass("hidden");
    });
})

function ModalDialog(titulo, texto) {
    var random = Math.random().toString().replace('.', '');
    var texto = '<div id="' + random + '" class="modal fade">                                                               ' +
        '        <div class="modal-dialog">                                                                                 ' +
        '            <div class="modal-content">                                                                            ' +
        '                <div class="modal-header">                                                                         ' +
        '                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>         ' +
        '                    <h4 class="modal-title">' + titulo + '</h4>                                                    ' +
        '                </div>                                                                                             ' +
        '                <div class="modal-body">                                                                           ' +
        '                    <p>' + texto + '</p>                                                                           ' +
        '                </div>                                                                                             ' +
        '                <div class="modal-footer">                                                                         ' +
        '                    <button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>             ' +
        '                                                                                                                   ' +
        '                </div>                                                                                             ' +
        '            </div><!-- /.modal-content -->                                                                         ' +
        '  </div><!-- /.modal-dialog -->                                                                                    ' +
        '</div> <!-- /.modal -->                                                                                        ';

    $('body').append(texto);
    $('#' + random).modal('show');
}

function ValidarCpfBeneficiario(cpf) {

    var multiplicador1 = [ 10, 9, 8, 7, 6, 5, 4, 3, 2 ];
    var multiplicador2 = [ 11, 10, 9, 8, 7, 6, 5, 4, 3, 2 ];
            var tempCpf;
            var digito;
            var soma = 0;
            var resto;

    cpf = cpf.trim();
    cpf = cpf.replace(".", "").replace(".", "").replace("-", "");
    
    if (cpf.length != 11)
        return false;

    tempCpf = cpf.substring(0, 9);
    
    for (var i = 0; i < 9; i++)
        soma += parseInt(tempCpf[i].toString()) * multiplicador1[i];

    resto = soma % 11;
    if (resto < 2)
        resto = 0;
    else
        resto = 11 - resto;

    digito = resto.toString();
    tempCpf = tempCpf + digito;

    soma = 0;
    for (var i = 0; i < 10; i++)
        soma += parseInt(tempCpf[i].toString()) * multiplicador2[i];

    resto = soma % 11;
    if (resto < 2)
        resto = 0;
    else
        resto = 11 - resto;

    digito = digito + resto.toString();
    if (cpf.endsWith(digito))
        return true;
    else
        return false;
}

function VerificarCpfExistente(CpfVerificar) {
    var CpfExiste = false;
    $('#ListaBeneficiarios tbody tr').each(function (index) {
        var CpfLinhaCorrente = $(this).children('td')[0].innerText;

        if (CpfVerificar == CpfLinhaCorrente) {
            CpfExiste = true;
            return false;
        }
    });

    return CpfExiste;
}

function AdicionarBeneficiarioLista(CpfBeneficiario, NomeBeneficiario) {
    
    var Codigo = "Temp" + Date.now().toString();

    var linha =
        "<tr codigo='" + Codigo + "'>" +
        "<td>" + CpfBeneficiario + "</td>" +
        "<td>" + NomeBeneficiario + "</td>" +
        "<td>" +
        "<button type='button' onClick='AlterarBeneficiario(this)' class='btn btn-sm btn-primary'>Alterar</button>" +
        "<button type='button' onClick='ExcluirBeneficiario(this)' class='btn btn-sm btn-primary'>Excluir</button>" +
        "</td>" +
        "</tr>";

    $('#ListaBeneficiarios tbody').append(linha);

    $('#NomeBeneficiario').val("");
    $('#CpfBeneficiario').val("");
    $('#Codigo').val("0");
}

function AlterarBeneficiarioLista(Codigo, CpfBeneficiario, NomeBeneficiario) {
    var Dados = $('#ListaBeneficiarios tbody tr[codigo="' + Codigo + '"]').children()
    Dados[0].innerText = CpfBeneficiario;
    Dados[1].innerText = NomeBeneficiario;

    $('#NomeBeneficiario').val("");
    $('#CpfBeneficiario').val("");
    $('#Codigo').val("0");

    $('#IncluirAlterarBeneficiario').html("Incluir");
    $('#CancelarAlterarBeneficiario').addClass("hidden");
}

function AlterarBeneficiario(e) {
    var Nome = $(e).parent().siblings()[1].innerText;
    var cpf = $(e).parent().siblings()[0].innerText;
    var Codigo = $(e).parent().parent().attr("Codigo");

    $('#NomeBeneficiario').val(Nome);
    $('#CpfBeneficiario').val(cpf);
    $('#Codigo').val(Codigo);

    $('#IncluirAlterarBeneficiario').html("Alterar");
    $('#CancelarAlterarBeneficiario').removeClass("hidden");
}

function ExcluirBeneficiario(e) {
    var Codigo = $(e).parent().parent().attr("Codigo");
    $('#ConfirmaExcluirBeneficiario').attr("Codigo", Codigo);
    $('#ConfirmaExcluirBeneficiario').modal('show');
}

function ConfirmarExclusao(resposta) {
    if (resposta) {
        $('#ListaBeneficiarios tbody tr').each(function (e) {
            var codigocorrente = $(this).attr("codigo");
            var codigoExcluir = $('#ConfirmaExcluirBeneficiario').attr("Codigo");

            if (codigocorrente == codigoExcluir) {
                $('#ListaBeneficiarios tbody tr[codigo="' + codigoExcluir + '"]').remove();
                $('#ConfirmaExcluirBeneficiario').modal('hide');
            }
        });
    } else {
        $('#ConfirmaExcluirBeneficiario').modal('hide');
        $('#ConfirmaExcluirBeneficiario').attr("Codigo", "0");
    }
}

